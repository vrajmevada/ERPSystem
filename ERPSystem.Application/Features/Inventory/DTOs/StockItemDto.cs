namespace ERPSystem.Application.Features.Inventory.DTOs;

public record StockItemDto(
    int Id,
    int ProductId,
    string ProductName,
    int WarehouseId,
    string WarehouseName,
    int Quantity);