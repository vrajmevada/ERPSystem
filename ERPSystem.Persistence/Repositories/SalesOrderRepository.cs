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

    public async Task<(List<SalesOrder> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        IQueryable<SalesOrder> query = _context.SalesOrders
            .Include(s => s.Customer)
            .Include(s => s.Items)
                .ThenInclude(i => i.Product);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(s => s.OrderNumber.Contains(search) || s.Customer.Name.Contains(search));
        }

        query = sortBy?.ToLower() switch
        {
            "ordernumber" => query.OrderBy(s => s.OrderNumber),
            "orderdate" => query.OrderBy(s => s.OrderDate),
            "status" => query.OrderBy(s => s.Status),
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