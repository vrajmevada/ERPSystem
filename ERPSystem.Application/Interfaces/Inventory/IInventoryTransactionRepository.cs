using ERPSystem.Domain.Entities.Inventory;

namespace ERPSystem.Application.Interfaces.Inventory;

public interface IInventoryTransactionRepository
{
    Task<List<InventoryTransaction>> GetAllAsync();

    Task<InventoryTransaction?> GetByIdAsync(int id);

    Task AddAsync(InventoryTransaction transaction);
}