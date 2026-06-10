using ERPSystem.Domain.Entities.Sales;

namespace ERPSystem.Application.Interfaces.Sales;

public interface ISalesOrderRepository
{
    Task<(List<SalesOrder> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<SalesOrder?> GetByIdAsync(int id);

    Task AddAsync(SalesOrder salesOrder);

    Task UpdateAsync(SalesOrder salesOrder);
}