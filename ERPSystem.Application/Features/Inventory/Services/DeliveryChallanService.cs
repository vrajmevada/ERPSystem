using ERPSystem.Application.Common;
using ERPSystem.Application.Exceptions;
using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Application.Interfaces;
using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Domain.Enums;
using Mapster;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ERPSystem.Application.Features.Inventory.Services;

public class DeliveryChallanService : IDeliveryChallanService
{
    private readonly IDeliveryChallanRepository _repository;
    private readonly IStockItemRepository _stockItemRepository;
    private readonly IInventoryTransactionRepository _transactionRepository;
    private readonly ITransactionManager _transactionManager;

    public DeliveryChallanService(
        IDeliveryChallanRepository repository,
        IStockItemRepository stockItemRepository,
        IInventoryTransactionRepository transactionRepository,
        ITransactionManager transactionManager)
    {
        _repository = repository;
        _stockItemRepository = stockItemRepository;
        _transactionRepository = transactionRepository;
        _transactionManager = transactionManager;
    }

    public async Task<PagedResult<DeliveryChallanDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        var (items, totalCount) = await _repository.GetAllAsync(search, sortBy, page, pageSize);
        var dtos = items.Adapt<List<DeliveryChallanDto>>();

        return new PagedResult<DeliveryChallanDto>(
            dtos,
            totalCount,
            page ?? 1,
            pageSize ?? totalCount);
    }

    public async Task<DeliveryChallanDto?> GetByIdAsync(int id)
    {
        var deliveryChallan = await _repository.GetByIdAsync(id);
        if (deliveryChallan == null) return null;

        return deliveryChallan.Adapt<DeliveryChallanDto>();
    }

    public async Task<DeliveryChallanDto> CreateAsync(CreateDeliveryChallanDto dto)
    {
        var deliveryChallan = new DeliveryChallan
        {
            ChallanNumber = $"DC-{DateTime.UtcNow.Ticks}",
            CustomerId = dto.CustomerId,
            FromWarehouseId = dto.FromWarehouseId,
            ChallanDate = dto.ChallanDate,
            Remarks = dto.Remarks,
            DispatchDocNo = dto.DispatchDocNo,
            DispatchThrough = dto.DispatchThrough,
            Destination = dto.Destination,
            TermsOfDelivery = dto.TermsOfDelivery,
            LRNo = dto.LRNo,
            LRDt = dto.LRDt,
            TransporterName = dto.TransporterName,
            IsLRReceived = dto.IsLRReceived,
            ContactPerson = dto.ContactPerson,
            Status = "Draft"
        };

        int currentLineNo = 1;
        foreach (var lineDto in dto.Lines)
        {
            decimal rawTotal = lineDto.UnitPrice * lineDto.Quantity;
            decimal discountAmt = rawTotal * (lineDto.DiscountPercentage / 100m);
            decimal totalAmt = rawTotal - discountAmt;

            deliveryChallan.Lines.Add(new DeliveryChallanLine
            {
                LineNo = currentLineNo++,
                ProductId = lineDto.ProductId,
                Quantity = lineDto.Quantity,
                UnitPrice = lineDto.UnitPrice,
                DiscountPercentage = lineDto.DiscountPercentage,
                DiscountAmount = discountAmt,
                TotalAmount = totalAmt,
                Notes = lineDto.Notes
            });
        }

        await _repository.AddAsync(deliveryChallan);

        var saved = await _repository.GetByIdAsync(deliveryChallan.Id);
        return saved!.Adapt<DeliveryChallanDto>();
    }

    public async Task ShipAsync(int id)
    {
        using var tx = await _transactionManager.BeginTransactionAsync();
        try
        {
            var deliveryChallan = await _repository.GetByIdAsync(id);
            if (deliveryChallan == null) throw new BusinessException("Delivery Challan not found.");

            if (deliveryChallan.Status != "Draft")
            {
                throw new BusinessException("Only Draft delivery challans can be shipped.");
            }

            var (stockItems, _) = await _stockItemRepository.GetAllAsync();

            foreach (var line in deliveryChallan.Lines)
            {
                var stockItem = stockItems.FirstOrDefault(s =>
                    s.ProductId == line.ProductId &&
                    s.WarehouseId == deliveryChallan.FromWarehouseId);

                if (stockItem == null || stockItem.Quantity < line.Quantity)
                {
                    throw new BusinessException($"Insufficient stock for Product ID {line.ProductId} in warehouse.");
                }

                // Decrement stock
                stockItem.Quantity -= line.Quantity;
                await _stockItemRepository.UpdateAsync(stockItem);

                // Log Inventory transaction ledger (DeliveryChallanOut)
                await _transactionRepository.AddAsync(new InventoryTransaction
                {
                    StockItemId = stockItem.Id,
                    QuantityChange = -line.Quantity,
                    TransactionType = InventoryTransactionType.DeliveryChallanOut,
                    TransactionDate = DateTime.UtcNow
                });
            }

            deliveryChallan.Status = "Shipped";
            await _repository.UpdateAsync(deliveryChallan);

            await _transactionManager.CommitAsync();
        }
        catch
        {
            await _transactionManager.RollbackAsync();
            throw;
        }
    }

    public async Task CancelAsync(int id)
    {
        using var tx = await _transactionManager.BeginTransactionAsync();
        try
        {
            var deliveryChallan = await _repository.GetByIdAsync(id);
            if (deliveryChallan == null) throw new BusinessException("Delivery Challan not found.");

            if (deliveryChallan.Status != "Draft" && deliveryChallan.Status != "Shipped")
            {
                throw new BusinessException("Only Draft or Shipped delivery challans can be cancelled.");
            }

            if (deliveryChallan.Status == "Shipped")
            {
                var (stockItems, _) = await _stockItemRepository.GetAllAsync();

                foreach (var line in deliveryChallan.Lines)
                {
                    var stockItem = stockItems.FirstOrDefault(s =>
                        s.ProductId == line.ProductId &&
                        s.WarehouseId == deliveryChallan.FromWarehouseId);

                    if (stockItem == null)
                    {
                        stockItem = new StockItem
                        {
                            ProductId = line.ProductId,
                            WarehouseId = deliveryChallan.FromWarehouseId,
                            Quantity = line.Quantity
                        };
                        await _stockItemRepository.AddAsync(stockItem);
                    }
                    else
                    {
                        stockItem.Quantity += line.Quantity;
                        await _stockItemRepository.UpdateAsync(stockItem);
                    }

                    // Log Inventory transaction ledger (TransferIn for return stock)
                    await _transactionRepository.AddAsync(new InventoryTransaction
                    {
                        StockItemId = stockItem.Id,
                        QuantityChange = line.Quantity,
                        TransactionType = InventoryTransactionType.TransferIn,
                        TransactionDate = DateTime.UtcNow
                    });
                }
            }

            deliveryChallan.Status = "Cancelled";
            await _repository.UpdateAsync(deliveryChallan);

            await _transactionManager.CommitAsync();
        }
        catch
        {
            await _transactionManager.RollbackAsync();
            throw;
        }
    }
}
