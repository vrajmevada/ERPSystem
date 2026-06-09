using ERPSystem.Domain.Entities.Sales;

namespace ERPSystem.Application.Interfaces.Sales;

public interface ISalesOrderRepository
{
    Task<List<SalesOrder>> GetAllAsync();

    Task<SalesOrder?> GetByIdAsync(int id);

    Task AddAsync(SalesOrder salesOrder);

    Task UpdateAsync(SalesOrder salesOrder);
}