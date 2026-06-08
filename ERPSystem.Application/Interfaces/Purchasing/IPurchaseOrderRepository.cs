using ERPSystem.Domain.Entities.Purchasing;

namespace ERPSystem.Application.Interfaces.Purchasing;

public interface IPurchaseOrderRepository
{
    Task<List<PurchaseOrder>> GetAllAsync();

    Task<PurchaseOrder?> GetByIdAsync(int id);

    Task AddAsync(PurchaseOrder purchaseOrder);

    Task UpdateAsync(PurchaseOrder purchaseOrder);
   
}