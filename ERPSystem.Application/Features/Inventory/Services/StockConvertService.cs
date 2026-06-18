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

public class StockConvertService : IStockConvertService
{
    private readonly IStockConvertRepository _repository;
    private readonly IStockItemRepository _stockItemRepository;
    private readonly IInventoryTransactionRepository _transactionRepository;
    private readonly ITransactionManager _transactionManager;

    public StockConvertService(
        IStockConvertRepository repository,
        IStockItemRepository stockItemRepository,
        IInventoryTransactionRepository transactionRepository,
        ITransactionManager transactionManager)
    {
        _repository = repository;
        _stockItemRepository = stockItemRepository;
        _transactionRepository = transactionRepository;
        _transactionManager = transactionManager;
    }

    public async Task<PagedResult<StockConvertDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        var (items, totalCount) = await _repository.GetAllAsync(search, sortBy, page, pageSize);
        var dtos = items.Adapt<List<StockConvertDto>>();

        return new PagedResult<StockConvertDto>(
            dtos,
            totalCount,
            page ?? 1,
            pageSize ?? totalCount);
    }

    public async Task<StockConvertDto?> GetByIdAsync(int id)
    {
        var stockConvert = await _repository.GetByIdAsync(id);
        if (stockConvert == null) return null;

        return stockConvert.Adapt<StockConvertDto>();
    }

    public async Task<StockConvertDto> CreateAsync(CreateStockConvertDto dto)
    {
        var stockConvert = new StockConvert
        {
            VoucherNumber = $"SC-{DateTime.UtcNow.Ticks}",
            TransactionDate = dto.TransactionDate,
            Remarks = dto.Remarks,
            Status = "Draft"
        };

        int sourceLineNo = 1;
        foreach (var sLine in dto.SourceLines)
        {
            stockConvert.SourceLines.Add(new StockConvertSourceLine
            {
                LineNo = sourceLineNo++,
                ProductId = sLine.ProductId,
                WarehouseId = sLine.WarehouseId,
                Quantity = sLine.Quantity
            });
        }

        int destLineNo = 1;
        foreach (var dLine in dto.DestinationLines)
        {
            stockConvert.DestinationLines.Add(new StockConvertDestinationLine
            {
                LineNo = destLineNo++,
                ProductId = dLine.ProductId,
                WarehouseId = dLine.WarehouseId,
                Quantity = dLine.Quantity
            });
        }

        await _repository.AddAsync(stockConvert);

        var saved = await _repository.GetByIdAsync(stockConvert.Id);
        return saved!.Adapt<StockConvertDto>();
    }

    public async Task ApproveAsync(int id)
    {
        using var tx = await _transactionManager.BeginTransactionAsync();
        try
        {
            var stockConvert = await _repository.GetByIdAsync(id);
            if (stockConvert == null) throw new BusinessException("Stock Conversion record not found.");

            if (stockConvert.Status != "Draft")
            {
                throw new BusinessException("Only Draft stock conversions can be approved.");
            }

            var (stockItems, _) = await _stockItemRepository.GetAllAsync();

            // Validate source stock availability first
            foreach (var line in stockConvert.SourceLines)
            {
                var stockItem = stockItems.FirstOrDefault(s =>
                    s.ProductId == line.ProductId &&
                    s.WarehouseId == line.WarehouseId);

                if (stockItem == null || stockItem.Quantity < line.Quantity)
                {
                    throw new BusinessException($"Insufficient stock for Product ID {line.ProductId} in source warehouse ID {line.WarehouseId}.");
                }
            }

            // Decrement source items
            foreach (var line in stockConvert.SourceLines)
            {
                var stockItem = stockItems.First(s =>
                    s.ProductId == line.ProductId &&
                    s.WarehouseId == line.WarehouseId);

                stockItem.Quantity -= line.Quantity;
                await _stockItemRepository.UpdateAsync(stockItem);

                await _transactionRepository.AddAsync(new InventoryTransaction
                {
                    StockItemId = stockItem.Id,
                    QuantityChange = -line.Quantity,
                    TransactionType = InventoryTransactionType.StockConvertIssue,
                    TransactionDate = DateTime.UtcNow
                });
            }

            // Increment destination items
            foreach (var line in stockConvert.DestinationLines)
            {
                var stockItem = stockItems.FirstOrDefault(s =>
                    s.ProductId == line.ProductId &&
                    s.WarehouseId == line.WarehouseId);

                if (stockItem == null)
                {
                    stockItem = new StockItem
                    {
                        ProductId = line.ProductId,
                        WarehouseId = line.WarehouseId,
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
                    TransactionType = InventoryTransactionType.StockConvertReceipt,
                    TransactionDate = DateTime.UtcNow
                });
            }

            stockConvert.Status = "Approved";
            await _repository.UpdateAsync(stockConvert);

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
            var stockConvert = await _repository.GetByIdAsync(id);
            if (stockConvert == null) throw new BusinessException("Stock Conversion record not found.");

            if (stockConvert.Status != "Draft" && stockConvert.Status != "Approved")
            {
                throw new BusinessException("Only Draft or Approved stock conversions can be cancelled.");
            }

            if (stockConvert.Status == "Approved")
            {
                var (stockItems, _) = await _stockItemRepository.GetAllAsync();

                // Reverse destination items (decrement produced stock)
                foreach (var line in stockConvert.DestinationLines)
                {
                    var stockItem = stockItems.FirstOrDefault(s =>
                        s.ProductId == line.ProductId &&
                        s.WarehouseId == line.WarehouseId);

                    if (stockItem == null || stockItem.Quantity < line.Quantity)
                    {
                        throw new BusinessException($"Cannot cancel conversion. Insufficient stock to reverse produced Product ID {line.ProductId} in warehouse ID {line.WarehouseId}.");
                    }

                    stockItem.Quantity -= line.Quantity;
                    await _stockItemRepository.UpdateAsync(stockItem);

                    await _transactionRepository.AddAsync(new InventoryTransaction
                    {
                        StockItemId = stockItem.Id,
                        QuantityChange = -line.Quantity,
                        TransactionType = InventoryTransactionType.StockConvertIssue,
                        TransactionDate = DateTime.UtcNow
                    });
                }

                // Reverse source items (increment consumed stock back)
                foreach (var line in stockConvert.SourceLines)
                {
                    var stockItem = stockItems.FirstOrDefault(s =>
                        s.ProductId == line.ProductId &&
                        s.WarehouseId == line.WarehouseId);

                    if (stockItem == null)
                    {
                        stockItem = new StockItem
                        {
                            ProductId = line.ProductId,
                            WarehouseId = line.WarehouseId,
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
                        TransactionType = InventoryTransactionType.StockConvertReceipt,
                        TransactionDate = DateTime.UtcNow
                    });
                }
            }

            stockConvert.Status = "Cancelled";
            await _repository.UpdateAsync(stockConvert);

            await _transactionManager.CommitAsync();
        }
        catch
        {
            await _transactionManager.RollbackAsync();
            throw;
        }
    }
}
