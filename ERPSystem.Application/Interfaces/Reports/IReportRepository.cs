using ERPSystem.Application.Features.Reports.DTOs;

namespace ERPSystem.Application.Interfaces.Reports;

public interface IReportRepository
{
    Task<List<LowStockReportDto>>GetLowStockItemsAsync();
    Task<InventorySummaryDto>GetInventorySummaryAsync();
    Task<SalesSummaryDto>GetSalesSummaryAsync();
    Task<PurchaseSummaryDto>GetPurchaseSummaryAsync();
    Task<List<StockReportDto>> GetStockReportAsync(int? warehouseId, int? productId);
    Task<List<StockSummaryReportDto>> GetStockSummaryReportAsync(int? productId);
    Task<List<TrackingDetailReportDto>> GetTrackingDetailReportAsync(int? productId, int? warehouseId, DateTime? startDate, DateTime? endDate);
}
