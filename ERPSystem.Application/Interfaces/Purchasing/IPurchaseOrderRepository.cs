using ERPSystem.Domain.Entities.Purchasing;

namespace ERPSystem.Application.Interfaces.Purchasing;

public interface IPurchaseOrderRepository
{
    Task<(List<PurchaseOrder> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<PurchaseOrder?> GetByIdAsync(int id);

    Task AddAsync(PurchaseOrder purchaseOrder);

    Task UpdateAsync(PurchaseOrder purchaseOrder);
   
}