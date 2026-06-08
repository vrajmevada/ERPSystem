using ERPSystem.Application.Interfaces.Purchasing;
using ERPSystem.Domain.Entities.Purchasing;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ERPSystem.Persistence.Repositories;

public class PurchaseOrderRepository
    : IPurchaseOrderRepository
{
    private readonly ApplicationDbContext _context;

    public PurchaseOrderRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PurchaseOrder>> GetAllAsync()
    {
        return await _context.PurchaseOrders
            .Include(p => p.Supplier)
            .Include(p => p.Items)
                .ThenInclude(i => i.Product)
            .ToListAsync();
    }

    public async Task<PurchaseOrder?> GetByIdAsync(int id)
    {
        return await _context.PurchaseOrders
            .Include(p => p.Supplier)
            .Include(p => p.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task AddAsync(
        PurchaseOrder purchaseOrder)
    {
        await _context.PurchaseOrders
            .AddAsync(purchaseOrder);

        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(
        PurchaseOrder purchaseOrder)
    {
        _context.PurchaseOrders.Update(
            purchaseOrder);

        await _context.SaveChangesAsync();
    }
}