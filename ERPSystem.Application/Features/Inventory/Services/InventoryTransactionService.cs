using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Application.Exceptions;
using Mapster;

namespace ERPSystem.Application.Features.Inventory.Services;

public class InventoryTransactionService
    : IInventoryTransactionService
{
    private readonly IInventoryTransactionRepository _transactionRepository;
    private readonly IStockItemRepository _stockItemRepository;

    public InventoryTransactionService(
        IInventoryTransactionRepository transactionRepository,
        IStockItemRepository stockItemRepository)
    {
        _transactionRepository = transactionRepository;
        _stockItemRepository = stockItemRepository;
    }

    public async Task<IEnumerable<InventoryTransactionDto>>
        GetAllAsync()
    {
        var transactions =
            await _transactionRepository.GetAllAsync();

        return transactions.Adapt<List<InventoryTransactionDto>>();
    }

    public async Task<InventoryTransactionDto?>
        GetByIdAsync(int id)
    {
        var transaction =
            await _transactionRepository.GetByIdAsync(id);

        if (transaction == null)
            return null;

        return transaction.Adapt<InventoryTransactionDto>();
    }

    public async Task<InventoryTransactionDto>
        CreateAsync(CreateInventoryTransactionDto dto)
    {
        var stockItem =
            await _stockItemRepository.GetByIdAsync(
                dto.StockItemId);

        if (stockItem == null)
            throw new Exception("Stock item not found.");
        if (stockItem.Quantity + dto.QuantityChange < 0)
        {
            throw new BusinessException("Insufficient stock.");
        }

        stockItem.Quantity += dto.QuantityChange;

        await _stockItemRepository.UpdateAsync(stockItem);

        var transaction = new InventoryTransaction
        {
            StockItemId = dto.StockItemId,
            QuantityChange = dto.QuantityChange,
            TransactionType = dto.TransactionType,
            TransactionDate = DateTime.UtcNow
        };

        await _transactionRepository.AddAsync(transaction);

        return transaction.Adapt<InventoryTransactionDto>();
    }
}