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

public class MaterialOutwardService : IMaterialOutwardService
{
    private readonly IMaterialOutwardRepository _repository;
    private readonly IStockItemRepository _stockItemRepository;
    private readonly IInventoryTransactionRepository _transactionRepository;
    private readonly ITransactionManager _transactionManager;

    public MaterialOutwardService(
        IMaterialOutwardRepository repository,
        IStockItemRepository stockItemRepository,
        IInventoryTransactionRepository transactionRepository,
        ITransactionManager transactionManager)
    {
        _repository = repository;
        _stockItemRepository = stockItemRepository;
        _transactionRepository = transactionRepository;
        _transactionManager = transactionManager;
    }

    public async Task<PagedResult<MaterialOutwardDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        var (items, totalCount) = await _repository.GetAllAsync(search, sortBy, page, pageSize);

        var dtos = items.Select(x => MapToDto(x)).ToList();

        return new PagedResult<MaterialOutwardDto>(
            dtos,
            totalCount,
            page ?? 1,
            pageSize ?? totalCount);
    }

    public async Task<MaterialOutwardDto?> GetByIdAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);
        if (item == null) return null;
        return MapToDto(item);
    }

    public async Task<MaterialOutwardDto> CreateAsync(CreateMaterialOutwardDto dto)
    {
        using var transaction = await _transactionManager.BeginTransactionAsync();
        try
        {
            var outward = new MaterialOutward
            {
                OutwardNumber = $"MO-{DateTime.UtcNow.Ticks}",
                WarehouseId = dto.WarehouseId,
                TransactionDate = dto.TransactionDate,
                Remarks = dto.Remarks ?? string.Empty,
                OutwardType = dto.OutwardType ?? "Others",
                ReferenceNumber = dto.ReferenceNumber ?? string.Empty,
                Status = "Draft",
                Lines = dto.Lines.Select((l, index) => new MaterialOutwardLine
                {
                    LineNo = index + 1,
                    ProductId = l.ProductId,
                    Quantity = l.Quantity,
                    Remarks = l.Remarks ?? string.Empty
                }).ToList()
            };

            await _repository.AddAsync(outward);
            await _transactionManager.CommitAsync();

            var reloaded = await _repository.GetByIdAsync(outward.Id);
            return MapToDto(reloaded!);
        }
        catch
        {
            await _transactionManager.RollbackAsync();
            throw;
        }
    }

    public async Task ApproveAsync(int id)
    {
        var outward = await _repository.GetByIdAsync(id);
        if (outward == null) throw new BusinessException("Material Outward record not found.");
        if (outward.Status != "Draft") throw new BusinessException("Only Draft records can be approved.");

        using var transaction = await _transactionManager.BeginTransactionAsync();
        try
        {
            outward.Status = "Approved";

            var (stockItems, _) = await _stockItemRepository.GetAllAsync();

            // Validate stock availability
            foreach (var line in outward.Lines)
            {
                var stockItem = stockItems.FirstOrDefault(s =>
                    s.ProductId == line.ProductId &&
                    s.WarehouseId == outward.WarehouseId);

                if (stockItem == null || stockItem.Quantity < line.Quantity)
                {
                    throw new BusinessException($"Insufficient stock for Product ID {line.ProductId} in warehouse ID {outward.WarehouseId}. Available stock is {(stockItem?.Quantity ?? 0)}.");
                }
            }

            // Perform decrements
            foreach (var line in outward.Lines)
            {
                var stockItem = stockItems.First(s =>
                    s.ProductId == line.ProductId &&
                    s.WarehouseId == outward.WarehouseId);

                stockItem.Quantity -= line.Quantity;
                await _stockItemRepository.UpdateAsync(stockItem);

                await _transactionRepository.AddAsync(new InventoryTransaction
                {
                    StockItemId = stockItem.Id,
                    QuantityChange = -line.Quantity,
                    TransactionType = InventoryTransactionType.MaterialOutward,
                    TransactionDate = DateTime.UtcNow
                });
            }

            await _repository.UpdateAsync(outward);
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
        var outward = await _repository.GetByIdAsync(id);
        if (outward == null) throw new BusinessException("Material Outward record not found.");
        if (outward.Status != "Approved") throw new BusinessException("Only Approved records can be cancelled.");

        using var transaction = await _transactionManager.BeginTransactionAsync();
        try
        {
            outward.Status = "Cancelled";

            var (stockItems, _) = await _stockItemRepository.GetAllAsync();

            foreach (var line in outward.Lines)
            {
                var stockItem = stockItems.FirstOrDefault(s =>
                    s.ProductId == line.ProductId &&
                    s.WarehouseId == outward.WarehouseId);

                if (stockItem == null)
                {
                    stockItem = new StockItem
                    {
                        ProductId = line.ProductId,
                        WarehouseId = outward.WarehouseId,
                        Quantity = line.Quantity
                    };
                    await _stockItemRepository.AddAsync(stockItem);
                }
                else
                {
                    stockItem.Quantity += line.Quantity;
                    await _stockItemRepository.UpdateAsync(stockItem);
                }

                await _transactionRepository.AddAsync(new InventoryTransaction
                {
                    StockItemId = stockItem.Id,
                    QuantityChange = line.Quantity,
                    TransactionType = InventoryTransactionType.MaterialOutward,
                    TransactionDate = DateTime.UtcNow
                });
            }

            await _repository.UpdateAsync(outward);
            await _transactionManager.CommitAsync();
        }
        catch
        {
            await _transactionManager.RollbackAsync();
            throw;
        }
    }

    private static MaterialOutwardDto MapToDto(MaterialOutward item)
    {
        return new MaterialOutwardDto(
            item.Id,
            item.OutwardNumber,
            item.WarehouseId,
            item.Warehouse.Name,
            item.TransactionDate,
            item.Remarks,
            item.Status,
            item.OutwardType,
            item.ReferenceNumber,
            item.Lines.Select(l => new MaterialOutwardLineDto(
                l.Id,
                l.LineNo,
                l.ProductId,
                l.Product.Name,
                l.Quantity,
                l.Remarks
            )).ToList()
        );
    }
}
