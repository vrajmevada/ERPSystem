namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateStockConvertSourceLineDto(
    int ProductId,
    int WarehouseId,
    int Quantity);
