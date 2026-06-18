using ERPSystem.Application.Features.Reports.DTOs;
using ERPSystem.Application.Interfaces.Reports;

namespace ERPSystem.Application.Features.Reports.Services;

public class ReportService : IReportService
{
    private readonly IReportRepository
        _repository;

    public ReportService(
        IReportRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<LowStockReportDto>>
        GetLowStockItemsAsync()
    {
        return await _repository
            .GetLowStockItemsAsync();
    }
    public async Task<InventorySummaryDto>
    GetInventorySummaryAsync()
    {
        return await _repository
            .GetInventorySummaryAsync();
    }
    public async Task<SalesSummaryDto>
    GetSalesSummaryAsync()
    {
        return await _repository
            .GetSalesSummaryAsync();
    }
    public async Task<PurchaseSummaryDto>
    GetPurchaseSummaryAsync()
    {
        return await _repository
            .GetPurchaseSummaryAsync();
    }

    public async Task<IEnumerable<StockReportDto>> GetStockReportAsync(int? warehouseId, int? productId)
    {
        return await _repository.GetStockReportAsync(warehouseId, productId);
    }

    public async Task<IEnumerable<StockSummaryReportDto>> GetStockSummaryReportAsync(int? productId)
    {
        return await _repository.GetStockSummaryReportAsync(productId);
    }

    public async Task<IEnumerable<TrackingDetailReportDto>> GetTrackingDetailReportAsync(int? productId, int? warehouseId, DateTime? startDate, DateTime? endDate)
    {
        return await _repository.GetTrackingDetailReportAsync(productId, warehouseId, startDate, endDate);
    }
}