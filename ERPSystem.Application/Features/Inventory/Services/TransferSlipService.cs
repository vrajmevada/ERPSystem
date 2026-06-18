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

public class TransferSlipService : ITransferSlipService
{
    private readonly ITransferSlipRepository _repository;
    private readonly IStockItemRepository _stockItemRepository;
    private readonly IInventoryTransactionRepository _transactionRepository;
    private readonly ITransactionManager _transactionManager;

    public TransferSlipService(
        ITransferSlipRepository repository,
        IStockItemRepository stockItemRepository,
        IInventoryTransactionRepository transactionRepository,
        ITransactionManager transactionManager)
    {
        _repository = repository;
        _stockItemRepository = stockItemRepository;
        _transactionRepository = transactionRepository;
        _transactionManager = transactionManager;
    }

    public async Task<PagedResult<TransferSlipDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        var (items, totalCount) = await _repository.GetAllAsync(search, sortBy, page, pageSize);
        var dtos = items.Adapt<List<TransferSlipDto>>();

        return new PagedResult<TransferSlipDto>(
            dtos,
            totalCount,
            page ?? 1,
            pageSize ?? totalCount);
    }

    public async Task<TransferSlipDto?> GetByIdAsync(int id)
    {
        var transferSlip = await _repository.GetByIdAsync(id);
        if (transferSlip == null) return null;

        return transferSlip.Adapt<TransferSlipDto>();
    }

    public async Task<TransferSlipDto> CreateAsync(CreateTransferSlipDto dto)
    {
        if (dto.FromWarehouseId == dto.ToWarehouseId)
        {
            throw new BusinessException("Source and Destination Warehouses cannot be the same.");
        }

        var transferSlip = new TransferSlip
        {
            SlipNumber = $"TS-{DateTime.UtcNow.Ticks}",
            FromWarehouseId = dto.FromWarehouseId,
            ToWarehouseId = dto.ToWarehouseId,
            TransferDate = DateTime.UtcNow,
            Status = "Draft",
            Remarks = dto.Remarks
        };

        int currentLineNo = 1;
        foreach (var lineDto in dto.Lines)
        {
            transferSlip.Lines.Add(new TransferSlipLine
            {
                LineNo = currentLineNo++,
                ProductId = lineDto.ProductId,
                Quantity = lineDto.Quantity,
                Notes = lineDto.Notes
            });
        }

        await _repository.AddAsync(transferSlip);

        var saved = await _repository.GetByIdAsync(transferSlip.Id);
        return saved!.Adapt<TransferSlipDto>();
    }

    public async Task ShipAsync(int id)
    {
        using var tx = await _transactionManager.BeginTransactionAsync();
        try
        {
            var transferSlip = await _repository.GetByIdAsync(id);
            if (transferSlip == null) throw new BusinessException("Transfer Slip not found.");

            if (transferSlip.Status != "Draft")
            {
                throw new BusinessException("Only Draft transfer slips can be shipped.");
            }

            var (stockItems, _) = await _stockItemRepository.GetAllAsync();

            foreach (var line in transferSlip.Lines)
            {
                int netQty = line.Quantity - line.ShortClosedQuantity;
                if (netQty <= 0) continue; // Skip if fully short closed in Draft

                var stockItem = stockItems.FirstOrDefault(s =>
                    s.ProductId == line.ProductId &&
                    s.WarehouseId == transferSlip.FromWarehouseId);

                if (stockItem == null || stockItem.Quantity < netQty)
                {
                    throw new BusinessException($"Insufficient stock for Product ID {line.ProductId} in source warehouse.");
                }

                // Decrement stock from source
                stockItem.Quantity -= netQty;
                await _stockItemRepository.UpdateAsync(stockItem);

                // Log Inventory transaction ledger (TransferOut)
                await _transactionRepository.AddAsync(new InventoryTransaction
                {
                    StockItemId = stockItem.Id,
                    QuantityChange = -netQty,
                    TransactionType = InventoryTransactionType.TransferOut,
                    TransactionDate = DateTime.UtcNow
                });
            }

            transferSlip.Status = "Shipped";
            await _repository.UpdateAsync(transferSlip);

            await _transactionManager.CommitAsync();
        }
        catch
        {
            await _transactionManager.RollbackAsync();
            throw;
        }
    }

    public async Task ReceiveAsync(int id)
    {
        using var tx = await _transactionManager.BeginTransactionAsync();
        try
        {
            var transferSlip = await _repository.GetByIdAsync(id);
            if (transferSlip == null) throw new BusinessException("Transfer Slip not found.");

            if (transferSlip.Status != "Shipped")
            {
                throw new BusinessException("Only Shipped transfer slips can be received.");
            }

            var (stockItems, _) = await _stockItemRepository.GetAllAsync();

            foreach (var line in transferSlip.Lines)
            {
                int netQty = line.Quantity - line.ShortClosedQuantity;
                if (netQty <= 0) continue; // Skip if fully short closed

                var stockItem = stockItems.FirstOrDefault(s =>
                    s.ProductId == line.ProductId &&
                    s.WarehouseId == transferSlip.ToWarehouseId);

                if (stockItem == null)
                {
                    stockItem = new StockItem
                    {
                        ProductId = line.ProductId,
                        WarehouseId = transferSlip.ToWarehouseId,
                        Quantity = netQty
                    };
                    await _stockItemRepository.AddAsync(stockItem);
                }
                else
                {
                    stockItem.Quantity += netQty;
                    await _stockItemRepository.UpdateAsync(stockItem);
                }

                // Log Inventory transaction ledger (TransferIn)
                await _transactionRepository.AddAsync(new InventoryTransaction
                {
                    StockItemId = stockItem.Id,
                    QuantityChange = netQty,
                    TransactionType = InventoryTransactionType.TransferIn,
                    TransactionDate = DateTime.UtcNow
                });
            }

            transferSlip.Status = "Approved";
            await _repository.UpdateAsync(transferSlip);

            await _transactionManager.CommitAsync();
        }
        catch
        {
            await _transactionManager.RollbackAsync();
            throw;
        }
    }

    public async Task ShortCloseAsync(int id, ShortCloseTransferSlipDto dto)
    {
        using var tx = await _transactionManager.BeginTransactionAsync();
        try
        {
            var transferSlip = await _repository.GetByIdAsync(id);
            if (transferSlip == null) throw new BusinessException("Transfer Slip not found.");

            if (transferSlip.Status != "Draft" && transferSlip.Status != "Shipped")
            {
                throw new BusinessException("Only Draft or Shipped transfer slips can be short closed.");
            }

            var (stockItems, _) = await _stockItemRepository.GetAllAsync();

            foreach (var lineDto in dto.Lines)
            {
                var line = transferSlip.Lines.FirstOrDefault(l => l.ProductId == lineDto.ProductId);
                if (line == null)
                {
                    throw new BusinessException($"Product ID {lineDto.ProductId} is not part of this transfer slip.");
                }

                int maxAllowed = line.Quantity - line.ShortClosedQuantity;
                if (lineDto.ShortCloseQuantity < 0 || lineDto.ShortCloseQuantity > maxAllowed)
                {
                    throw new BusinessException($"Short close quantity {lineDto.ShortCloseQuantity} for Product ID {lineDto.ProductId} must be between 0 and {maxAllowed}.");
                }

                if (lineDto.ShortCloseQuantity == 0) continue;

                if (transferSlip.Status == "Shipped")
                {
                    // Return the short-closed quantity back to the source warehouse
                    var stockItem = stockItems.FirstOrDefault(s =>
                        s.ProductId == line.ProductId &&
                        s.WarehouseId == transferSlip.FromWarehouseId);

                    if (stockItem == null)
                    {
                        stockItem = new StockItem
                        {
                            ProductId = line.ProductId,
                            WarehouseId = transferSlip.FromWarehouseId,
                            Quantity = lineDto.ShortCloseQuantity
                        };
                        await _stockItemRepository.AddAsync(stockItem);
                    }
                    else
                    {
                        stockItem.Quantity += lineDto.ShortCloseQuantity;
                        await _stockItemRepository.UpdateAsync(stockItem);
                    }

                    // Log Inventory transaction ledger (TransferIn because it's returning back to source)
                    await _transactionRepository.AddAsync(new InventoryTransaction
                    {
                        StockItemId = stockItem.Id,
                        QuantityChange = lineDto.ShortCloseQuantity,
                        TransactionType = InventoryTransactionType.TransferIn,
                        TransactionDate = DateTime.UtcNow
                    });
                }

                line.ShortClosedQuantity += lineDto.ShortCloseQuantity;
            }

            // If all lines are fully short closed, change status to Cancelled
            if (transferSlip.Lines.All(l => l.Quantity == l.ShortClosedQuantity))
            {
                transferSlip.Status = "Cancelled";
            }

            await _repository.UpdateAsync(transferSlip);
            await _transactionManager.CommitAsync();
        }
        catch
        {
            await _transactionManager.RollbackAsync();
            throw;
        }
    }
}
