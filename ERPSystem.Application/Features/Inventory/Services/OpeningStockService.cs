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

public class OpeningStockService : IOpeningStockService
{
    private readonly IOpeningStockRepository _repository;
    private readonly IStockItemRepository _stockItemRepository;
    private readonly IInventoryTransactionRepository _transactionRepository;
    private readonly ITransactionManager _transactionManager;

    public OpeningStockService(
        IOpeningStockRepository repository,
        IStockItemRepository stockItemRepository,
        IInventoryTransactionRepository transactionRepository,
        ITransactionManager transactionManager)
    {
        _repository = repository;
        _stockItemRepository = stockItemRepository;
        _transactionRepository = transactionRepository;
        _transactionManager = transactionManager;
    }

    public async Task<PagedResult<OpeningStockDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        var (items, totalCount) = await _repository.GetAllAsync(search, sortBy, page, pageSize);

        var dtos = items.Select(x => new OpeningStockDto(
            x.Id,
            x.ProductId,
            x.Product.Name,
            x.WarehouseId,
            x.Warehouse.Name,
            x.Quantity,
            x.Rate,
            x.Amount,
            x.TransactionDate,
            x.Remarks
        )).ToList();

        return new PagedResult<OpeningStockDto>(
            dtos,
            totalCount,
            page ?? 1,
            pageSize ?? totalCount);
    }

    public async Task<OpeningStockDto?> GetByIdAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);
        if (item == null) return null;

        return new OpeningStockDto(
            item.Id,
            item.ProductId,
            item.Product.Name,
            item.WarehouseId,
            item.Warehouse.Name,
            item.Quantity,
            item.Rate,
            item.Amount,
            item.TransactionDate,
            item.Remarks
        );
    }

    public async Task<OpeningStockDto> CreateAsync(CreateOpeningStockDto dto)
    {
        using var transaction = await _transactionManager.BeginTransactionAsync();
        try
        {
            var openingStock = new OpeningStock
            {
                ProductId = dto.ProductId,
                WarehouseId = dto.WarehouseId,
                Quantity = dto.Quantity,
                Rate = dto.Rate,
                Amount = dto.Quantity * dto.Rate,
                TransactionDate = dto.TransactionDate,
                Remarks = dto.Remarks
            };

            await _repository.AddAsync(openingStock);

            // Fetch or create stock item
            var (stockItems, _) = await _stockItemRepository.GetAllAsync();
            var stockItem = stockItems.FirstOrDefault(s =>
                s.ProductId == dto.ProductId &&
                s.WarehouseId == dto.WarehouseId);

            if (stockItem == null)
            {
                stockItem = new StockItem
                {
                    ProductId = dto.ProductId,
                    WarehouseId = dto.WarehouseId,
                    Quantity = dto.Quantity
                };
                await _stockItemRepository.AddAsync(stockItem);
            }
            else
            {
                stockItem.Quantity += dto.Quantity;
                await _stockItemRepository.UpdateAsync(stockItem);
            }

            // Log transaction
            await _transactionRepository.AddAsync(new InventoryTransaction
            {
                StockItemId = stockItem.Id,
                QuantityChange = dto.Quantity,
                TransactionType = InventoryTransactionType.OpeningStock,
                TransactionDate = dto.TransactionDate
            });

            await _transactionManager.CommitAsync();

            // Reload to populate navigation properties
            var reloaded = await _repository.GetByIdAsync(openingStock.Id);
            return new OpeningStockDto(
                reloaded!.Id,
                reloaded.ProductId,
                reloaded.Product.Name,
                reloaded.WarehouseId,
                reloaded.Warehouse.Name,
                reloaded.Quantity,
                reloaded.Rate,
                reloaded.Amount,
                reloaded.TransactionDate,
                reloaded.Remarks
            );
        }
        catch
        {
            await _transactionManager.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);
        if (item == null) return false;

        using var transaction = await _transactionManager.BeginTransactionAsync();
        try
        {
            var (stockItems, _) = await _stockItemRepository.GetAllAsync();
            var stockItem = stockItems.FirstOrDefault(s =>
                s.ProductId == item.ProductId &&
                s.WarehouseId == item.WarehouseId);

            if (stockItem != null)
            {
                if (stockItem.Quantity - item.Quantity < 0)
                {
                    throw new BusinessException($"Cannot delete opening stock record. Stock level for Product ID {item.ProductId} in warehouse ID {item.WarehouseId} would fall below 0.");
                }

                stockItem.Quantity -= item.Quantity;
                await _stockItemRepository.UpdateAsync(stockItem);

                // Log opposing transaction
                await _transactionRepository.AddAsync(new InventoryTransaction
                {
                    StockItemId = stockItem.Id,
                    QuantityChange = -item.Quantity,
                    TransactionType = InventoryTransactionType.OpeningStock,
                    TransactionDate = DateTime.UtcNow
                });
            }

            await _repository.DeleteAsync(item);
            await _transactionManager.CommitAsync();
            return true;
        }
        catch
        {
            await _transactionManager.RollbackAsync();
            throw;
        }
    }
}
