namespace ERPSystem.Application.Features.Inventory.DTOs;

public record StockConvertDestinationLineDto(
    int Id,
    int StockConvertId,
    int LineNo,
    int ProductId,
    string ProductName,
    int WarehouseId,
    string WarehouseName,
    int Quantity);
