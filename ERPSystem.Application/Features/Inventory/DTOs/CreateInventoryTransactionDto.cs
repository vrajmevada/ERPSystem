namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateInventoryTransactionDto(
    int StockItemId,
    int QuantityChange,
    string TransactionType);