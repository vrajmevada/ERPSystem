using ERPSystem.Application.Features.Reports.DTOs;

namespace ERPSystem.Application.Features.Reports.Services;

public interface IReportService
{
    Task<IEnumerable<LowStockReportDto>>
        GetLowStockItemsAsync();
    Task<InventorySummaryDto>GetInventorySummaryAsync();
}