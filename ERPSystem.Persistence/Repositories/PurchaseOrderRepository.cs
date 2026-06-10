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

    public async Task<(List<PurchaseOrder> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        IQueryable<PurchaseOrder> query = _context.PurchaseOrders
            .Include(p => p.Supplier)
            .Include(p => p.Items)
                .ThenInclude(i => i.Product);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p => p.OrderNumber.Contains(search) || p.Supplier.Name.Contains(search));
        }

        query = sortBy?.ToLower() switch
        {
            "ordernumber" => query.OrderBy(p => p.OrderNumber),
            "orderdate" => query.OrderBy(p => p.OrderDate),
            "status" => query.OrderBy(p => p.Status),
            _ => query.OrderBy(p => p.Id)
        };

        int totalCount = await query.CountAsync();

        if (page.HasValue && pageSize.HasValue)
        {
            query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
        }

        var items = await query.ToListAsync();
        return (items, totalCount);
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