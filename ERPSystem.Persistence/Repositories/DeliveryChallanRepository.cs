using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ERPSystem.Persistence.Repositories;

public class DeliveryChallanRepository : IDeliveryChallanRepository
{
    private readonly ApplicationDbContext _context;

    public DeliveryChallanRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(List<DeliveryChallan> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        IQueryable<DeliveryChallan> query = _context.DeliveryChallans
            .Include(d => d.Customer)
            .Include(d => d.FromWarehouse)
            .Include(d => d.Lines)
                .ThenInclude(l => l.Product);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(d => d.ChallanNumber.Contains(search)
                || d.Remarks.Contains(search)
                || d.Customer.Name.Contains(search)
                || d.FromWarehouse.Name.Contains(search)
                || d.Status.Contains(search));
        }

        query = sortBy?.ToLower() switch
        {
            "challannumber" => query.OrderBy(d => d.ChallanNumber),
            "challandate" => query.OrderBy(d => d.ChallanDate),
            "status" => query.OrderBy(d => d.Status),
            _ => query.OrderBy(d => d.Id)
        };

        int totalCount = await query.CountAsync();

        if (page.HasValue && pageSize.HasValue)
        {
            query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
        }

        var items = await query.ToListAsync();
        return (items, totalCount);
    }

    public async Task<DeliveryChallan?> GetByIdAsync(int id)
    {
        return await _context.DeliveryChallans
            .Include(d => d.Customer)
            .Include(d => d.FromWarehouse)
            .Include(d => d.Lines)
                .ThenInclude(l => l.Product)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task AddAsync(DeliveryChallan deliveryChallan)
    {
        await _context.DeliveryChallans.AddAsync(deliveryChallan);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(DeliveryChallan deliveryChallan)
    {
        _context.DeliveryChallans.Update(deliveryChallan);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(DeliveryChallan deliveryChallan)
    {
        _context.DeliveryChallans.Remove(deliveryChallan);
        await _context.SaveChangesAsync();
    }
}
