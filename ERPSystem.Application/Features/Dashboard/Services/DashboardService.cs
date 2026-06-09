using ERPSystem.Application.Features.Dashboard.DTOs;
using ERPSystem.Application.Interfaces.Dashboard;

namespace ERPSystem.Application.Features.Dashboard.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _repository;

    public DashboardService(
        IDashboardRepository repository)
    {
        _repository = repository;
    }

    public async Task<DashboardSummaryDto>
        GetSummaryAsync()
    {
        return new DashboardSummaryDto(
            await _repository.GetProductCountAsync(),
            await _repository.GetCustomerCountAsync(),
            await _repository.GetSupplierCountAsync(),
            await _repository.GetWarehouseCountAsync(),
            await _repository.GetPurchaseOrderCountAsync(),
            await _repository.GetSalesOrderCountAsync(),
            await _repository.GetStockItemCountAsync(),
            await _repository.GetLowStockCountAsync()
        );
    }
}