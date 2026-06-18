namespace ERPSystem.Application.Features.Reports.DTOs;

public record StockSummaryReportDto(
    int ProductId,
    string ProductName,
    int TotalQuantity);
