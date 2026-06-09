using ERPSystem.Application.Interfaces.Sales;
using ERPSystem.Domain.Entities.Sales;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ERPSystem.Persistence.Repositories;

public class SalesOrderRepository
    : ISalesOrderRepository
{
    private readonly ApplicationDbContext _context;

    public SalesOrderRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SalesOrder>> GetAllAsync()
    {
        return await _context.SalesOrders
            .Include(s => s.Customer)
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
            .ToListAsync();
    }

    public async Task<SalesOrder?> GetByIdAsync(int id)
    {
        return await _context.SalesOrders
            .Include(s => s.Customer)
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task AddAsync(
        SalesOrder salesOrder)
    {
        await _context.SalesOrders
            .AddAsync(salesOrder);

        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(
        SalesOrder salesOrder)
    {
        _context.SalesOrders.Update(
            salesOrder);

        await _context.SaveChangesAsync();
    }
}