using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ERPSystem.Persistence.Repositories;

public class MaterialOutwardRepository : IMaterialOutwardRepository
{
    private readonly ApplicationDbContext _context;

    public MaterialOutwardRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(List<MaterialOutward> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        IQueryable<MaterialOutward> query = _context.MaterialOutwards
            .Include(m => m.Warehouse)
            .Include(m => m.Lines)
                .ThenInclude(l => l.Product);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(m => m.OutwardNumber.Contains(search)
                || m.Remarks.Contains(search)
                || m.ReferenceNumber.Contains(search)
                || m.OutwardType.Contains(search));
        }

        query = sortBy?.ToLower() switch
        {
            "outwardnumber" => query.OrderBy(m => m.OutwardNumber),
            "transactiondate" => query.OrderBy(m => m.TransactionDate),
            "status" => query.OrderBy(m => m.Status),
            _ => query.OrderBy(m => m.Id)
        };

        int totalCount = await query.CountAsync();

        if (page.HasValue && pageSize.HasValue)
        {
            query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
        }

        var items = await query.ToListAsync();
        return (items, totalCount);
    }

    public async Task<MaterialOutward?> GetByIdAsync(int id)
    {
        return await _context.MaterialOutwards
            .Include(m => m.Warehouse)
            .Include(m => m.Lines)
                .ThenInclude(l => l.Product)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task AddAsync(MaterialOutward outward)
    {
        await _context.MaterialOutwards.AddAsync(outward);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(MaterialOutward outward)
    {
        _context.MaterialOutwards.Update(outward);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(MaterialOutward outward)
    {
        _context.MaterialOutwards.Remove(outward);
        await _context.SaveChangesAsync();
    }
}
