namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateStockItemDto(
    int ProductId,
    int WarehouseId,
    int Quantity);