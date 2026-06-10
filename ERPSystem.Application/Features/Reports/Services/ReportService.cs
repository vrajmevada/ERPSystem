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
}