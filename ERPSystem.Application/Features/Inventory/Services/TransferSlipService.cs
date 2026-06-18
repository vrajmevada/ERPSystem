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
                var stockItem = stockItems.FirstOrDefault(s =>
                    s.ProductId == line.ProductId &&
                    s.WarehouseId == transferSlip.FromWarehouseId);

                if (stockItem == null || stockItem.Quantity < line.Quantity)
                {
                    throw new BusinessException($"Insufficient stock for Product ID {line.ProductId} in source warehouse.");
                }

                // Decrement stock from source
                stockItem.Quantity -= line.Quantity;
                await _stockItemRepository.UpdateAsync(stockItem);

                // Log Inventory transaction ledger (TransferOut)
                await _transactionRepository.AddAsync(new InventoryTransaction
                {
                    StockItemId = stockItem.Id,
                    QuantityChange = -line.Quantity,
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
                var stockItem = stockItems.FirstOrDefault(s =>
                    s.ProductId == line.ProductId &&
                    s.WarehouseId == transferSlip.ToWarehouseId);

                if (stockItem == null)
                {
                    stockItem = new StockItem
                    {
                        ProductId = line.ProductId,
                        WarehouseId = transferSlip.ToWarehouseId,
                        Quantity = line.Quantity
                    };
                    await _stockItemRepository.AddAsync(stockItem);
                }
                else
                {
                    stockItem.Quantity += line.Quantity;
                    await _stockItemRepository.UpdateAsync(stockItem);
                }

                // Log Inventory transaction ledger (TransferIn)
                await _transactionRepository.AddAsync(new InventoryTransaction
                {
                    StockItemId = stockItem.Id,
                    QuantityChange = line.Quantity,
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
}
