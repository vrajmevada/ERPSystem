namespace ERPSystem.Application.Features.Inventory.DTOs;

using ERPSystem.Domain.Enums;
public record InventoryTransactionDto(
    int Id,
    int StockItemId,
    int QuantityChange,
    InventoryTransactionType TransactionType,
    DateTime TransactionDate);