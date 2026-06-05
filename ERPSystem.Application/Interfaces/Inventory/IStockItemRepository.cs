using ERPSystem.Domain.Entities.Inventory;

namespace ERPSystem.Application.Interfaces.Inventory;

public interface IStockItemRepository
{
    Task<List<StockItem>> GetAllAsync();

    Task<StockItem?> GetByIdAsync(int id);

    Task AddAsync(StockItem stockItem);

    Task UpdateAsync(StockItem stockItem);

    Task DeleteAsync(StockItem stockItem);
}