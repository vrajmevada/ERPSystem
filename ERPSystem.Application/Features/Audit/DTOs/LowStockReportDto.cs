namespace ERPSystem.Application.Features.Reports.DTOs;

public record LowStockReportDto(
    int ProductId,
    string ProductName,
    string WarehouseName,
    int Quantity);