namespace ERPSystem.Application.Features.Reports.DTOs;

public record StockReportDto(
    int ProductId,
    string ProductName,
    int WarehouseId,
    string WarehouseName,
    int Quantity);
