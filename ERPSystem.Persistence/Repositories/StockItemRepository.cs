using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ERPSystem.Persistence.Repositories;

public class StockItemRepository : IStockItemRepository
{
    private readonly ApplicationDbContext _context;

    public StockItemRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(List<StockItem> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        IQueryable<StockItem> query = _context.StockItems
            .Include(s => s.Product)
            .Include(s => s.Warehouse);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(s => s.Product.Name.Contains(search) || s.Warehouse.Name.Contains(search));
        }

        query = sortBy?.ToLower() switch
        {
            "productname" => query.OrderBy(s => s.Product.Name),
            "warehousename" => query.OrderBy(s => s.Warehouse.Name),
            "quantity" => query.OrderBy(s => s.Quantity),
            _ => query.OrderBy(s => s.Id)
        };

        int totalCount = await query.CountAsync();

        if (page.HasValue && pageSize.HasValue)
        {
            query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
        }

        var items = await query.ToListAsync();
        return (items, totalCount);
    }

    public async Task<StockItem?> GetByIdAsync(int id)
    {
        return await _context.StockItems
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task AddAsync(StockItem stockItem)
    {
        await _context.StockItems.AddAsync(stockItem);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(StockItem stockItem)
    {
        _context.StockItems.Update(stockItem);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(StockItem stockItem)
    {
        _context.StockItems.Remove(stockItem);
        await _context.SaveChangesAsync();
    }
}