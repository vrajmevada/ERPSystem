namespace ERPSystem.Application.Features.Inventory.DTOs;

public record InventoryTransactionDto(
    int Id,
    int StockItemId,
    int QuantityChange,
    string TransactionType,
    DateTime TransactionDate);