namespace ERPSystem.Application.Features.Reports.DTOs;

public record InventorySummaryDto(
    int TotalStockItems,
    int TotalQuantity,
    int LowStockItems);