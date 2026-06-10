using ERPSystem.Application.Features.Reports.DTOs;

namespace ERPSystem.Application.Interfaces.Reports;

public interface IReportRepository
{
    Task<List<LowStockReportDto>>
        GetLowStockItemsAsync();
    Task<InventorySummaryDto>
    GetInventorySummaryAsync();
    Task<SalesSummaryDto>
    GetSalesSummaryAsync();
}
