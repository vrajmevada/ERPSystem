using ERPSystem.Domain.Entities.Inventory;

namespace ERPSystem.Application.Interfaces.Inventory;

public interface IWarehouseRepository
{
    Task<List<Warehouse>> GetAllAsync();

    Task<Warehouse?> GetByIdAsync(int id);

    Task AddAsync(Warehouse warehouse);

    Task UpdateAsync(Warehouse warehouse);

    Task DeleteAsync(Warehouse warehouse);
}