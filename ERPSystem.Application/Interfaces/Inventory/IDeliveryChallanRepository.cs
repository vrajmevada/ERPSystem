using ERPSystem.Domain.Entities.Inventory;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERPSystem.Application.Interfaces.Inventory;

public interface IDeliveryChallanRepository
{
    Task<(List<DeliveryChallan> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<DeliveryChallan?> GetByIdAsync(int id);
    Task AddAsync(DeliveryChallan deliveryChallan);
    Task UpdateAsync(DeliveryChallan deliveryChallan);
    Task DeleteAsync(DeliveryChallan deliveryChallan);
}
