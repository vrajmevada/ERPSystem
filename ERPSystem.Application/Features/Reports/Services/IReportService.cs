using ERPSystem.Application.Features.Reports.DTOs;

namespace ERPSystem.Application.Features.Reports.Services;

public interface IReportService
{
    Task<IEnumerable<LowStockReportDto>>GetLowStockItemsAsync();
    Task<InventorySummaryDto>GetInventorySummaryAsync();
    Task<SalesSummaryDto>GetSalesSummaryAsync();
    Task<PurchaseSummaryDto>GetPurchaseSummaryAsync();
    Task<IEnumerable<StockReportDto>> GetStockReportAsync(int? warehouseId, int? productId);
    Task<IEnumerable<StockSummaryReportDto>> GetStockSummaryReportAsync(int? productId);
    Task<IEnumerable<TrackingDetailReportDto>> GetTrackingDetailReportAsync(int? productId, int? warehouseId, DateTime? startDate, DateTime? endDate);
}