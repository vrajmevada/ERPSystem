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

    public async Task<List<StockItem>> GetAllAsync()
    {
        return await _context.StockItems
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .ToListAsync();
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