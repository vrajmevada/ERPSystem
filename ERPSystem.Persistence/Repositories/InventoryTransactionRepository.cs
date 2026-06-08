using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ERPSystem.Persistence.Repositories;

public class InventoryTransactionRepository
    : IInventoryTransactionRepository
{
    private readonly ApplicationDbContext _context;

    public InventoryTransactionRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<InventoryTransaction>> GetAllAsync()
    {
        return await _context.InventoryTransactions
            .Include(t => t.StockItem)
            .ToListAsync();
    }

    public async Task<InventoryTransaction?> GetByIdAsync(int id)
    {
        return await _context.InventoryTransactions
            .Include(t => t.StockItem)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task AddAsync(
        InventoryTransaction transaction)
    {
        await _context.InventoryTransactions
            .AddAsync(transaction);

        await _context.SaveChangesAsync();
    }
}