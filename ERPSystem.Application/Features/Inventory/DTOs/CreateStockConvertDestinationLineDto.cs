namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateStockConvertDestinationLineDto(
    int ProductId,
    int WarehouseId,
    int Quantity);
