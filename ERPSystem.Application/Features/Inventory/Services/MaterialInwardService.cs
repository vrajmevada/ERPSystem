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

public class MaterialInwardService : IMaterialInwardService
{
    private readonly IMaterialInwardRepository _repository;
    private readonly IStockItemRepository _stockItemRepository;
    private readonly IInventoryTransactionRepository _transactionRepository;
    private readonly ITransactionManager _transactionManager;

    public MaterialInwardService(
        IMaterialInwardRepository repository,
        IStockItemRepository stockItemRepository,
        IInventoryTransactionRepository transactionRepository,
        ITransactionManager transactionManager)
    {
        _repository = repository;
        _stockItemRepository = stockItemRepository;
        _transactionRepository = transactionRepository;
        _transactionManager = transactionManager;
    }

    public async Task<PagedResult<MaterialInwardDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        var (items, totalCount) = await _repository.GetAllAsync(search, sortBy, page, pageSize);

        var dtos = items.Select(x => MapToDto(x)).ToList();

        return new PagedResult<MaterialInwardDto>(
            dtos,
            totalCount,
            page ?? 1,
            pageSize ?? totalCount);
    }

    public async Task<MaterialInwardDto?> GetByIdAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);
        if (item == null) return null;
        return MapToDto(item);
    }

    public async Task<MaterialInwardDto> CreateAsync(CreateMaterialInwardDto dto)
    {
        using var transaction = await _transactionManager.BeginTransactionAsync();
        try
        {
            var inward = new MaterialInward
            {
                InwardNumber = $"MI-{DateTime.UtcNow.Ticks}",
                WarehouseId = dto.WarehouseId,
                TransactionDate = dto.TransactionDate,
                Remarks = dto.Remarks ?? string.Empty,
                InwardType = dto.InwardType ?? "Others",
                ReferenceNumber = dto.ReferenceNumber ?? string.Empty,
                Status = "Draft",
                Lines = dto.Lines.Select((l, index) => new MaterialInwardLine
                {
                    LineNo = index + 1,
                    ProductId = l.ProductId,
                    Quantity = l.Quantity,
                    Remarks = l.Remarks ?? string.Empty
                }).ToList()
            };

            await _repository.AddAsync(inward);
            await _transactionManager.CommitAsync();

            var reloaded = await _repository.GetByIdAsync(inward.Id);
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
        var inward = await _repository.GetByIdAsync(id);
        if (inward == null) throw new BusinessException("Material Inward record not found.");
        if (inward.Status != "Draft") throw new BusinessException("Only Draft records can be approved.");

        using var transaction = await _transactionManager.BeginTransactionAsync();
        try
        {
            inward.Status = "Approved";

            var (stockItems, _) = await _stockItemRepository.GetAllAsync();

            foreach (var line in inward.Lines)
            {
                var stockItem = stockItems.FirstOrDefault(s =>
                    s.ProductId == line.ProductId &&
                    s.WarehouseId == inward.WarehouseId);

                if (stockItem == null)
                {
                    stockItem = new StockItem
                    {
                        ProductId = line.ProductId,
                        WarehouseId = inward.WarehouseId,
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
                    TransactionType = InventoryTransactionType.MaterialInward,
                    TransactionDate = DateTime.UtcNow
                });
            }

            await _repository.UpdateAsync(inward);
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
        var inward = await _repository.GetByIdAsync(id);
        if (inward == null) throw new BusinessException("Material Inward record not found.");
        if (inward.Status != "Approved") throw new BusinessException("Only Approved records can be cancelled.");

        using var transaction = await _transactionManager.BeginTransactionAsync();
        try
        {
            inward.Status = "Cancelled";

            var (stockItems, _) = await _stockItemRepository.GetAllAsync();

            // Validate that we won't end up with negative stock
            foreach (var line in inward.Lines)
            {
                var stockItem = stockItems.FirstOrDefault(s =>
                    s.ProductId == line.ProductId &&
                    s.WarehouseId == inward.WarehouseId);

                if (stockItem == null || stockItem.Quantity - line.Quantity < 0)
                {
                    throw new BusinessException($"Cannot cancel Material Inward. Insufficient stock for Product ID {line.ProductId} in warehouse ID {inward.WarehouseId}.");
                }
            }

            // Perform decrements
            foreach (var line in inward.Lines)
            {
                var stockItem = stockItems.First(s =>
                    s.ProductId == line.ProductId &&
                    s.WarehouseId == inward.WarehouseId);

                stockItem.Quantity -= line.Quantity;
                await _stockItemRepository.UpdateAsync(stockItem);

                await _transactionRepository.AddAsync(new InventoryTransaction
                {
                    StockItemId = stockItem.Id,
                    QuantityChange = -line.Quantity,
                    TransactionType = InventoryTransactionType.MaterialInward,
                    TransactionDate = DateTime.UtcNow
                });
            }

            await _repository.UpdateAsync(inward);
            await _transactionManager.CommitAsync();
        }
        catch
        {
            await _transactionManager.RollbackAsync();
            throw;
        }
    }

    private static MaterialInwardDto MapToDto(MaterialInward item)
    {
        return new MaterialInwardDto(
            item.Id,
            item.InwardNumber,
            item.WarehouseId,
            item.Warehouse.Name,
            item.TransactionDate,
            item.Remarks,
            item.Status,
            item.InwardType,
            item.ReferenceNumber,
            item.Lines.Select(l => new MaterialInwardLineDto(
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
