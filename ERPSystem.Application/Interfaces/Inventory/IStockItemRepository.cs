using ERPSystem.Domain.Entities.Inventory;

namespace ERPSystem.Application.Interfaces.Inventory;

public interface IStockItemRepository
{
    Task<(List<StockItem> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<StockItem?> GetByIdAsync(int id);

    Task AddAsync(StockItem stockItem);

    Task UpdateAsync(StockItem stockItem);

    Task DeleteAsync(StockItem stockItem);
}