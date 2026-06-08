namespace ERPSystem.Application.Features.Inventory.DTOs;

using ERPSystem.Domain.Enums;
public record CreateInventoryTransactionDto(
    int StockItemId,
    int QuantityChange,
    InventoryTransactionType TransactionType);