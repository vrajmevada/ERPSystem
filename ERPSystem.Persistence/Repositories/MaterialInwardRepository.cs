using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ERPSystem.Persistence.Repositories;

public class MaterialInwardRepository : IMaterialInwardRepository
{
    private readonly ApplicationDbContext _context;

    public MaterialInwardRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(List<MaterialInward> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        IQueryable<MaterialInward> query = _context.MaterialInwards
            .Include(m => m.Warehouse)
            .Include(m => m.Lines)
                .ThenInclude(l => l.Product);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(m => m.InwardNumber.Contains(search)
                || m.Remarks.Contains(search)
                || m.ReferenceNumber.Contains(search)
                || m.InwardType.Contains(search));
        }

        query = sortBy?.ToLower() switch
        {
            "inwardnumber" => query.OrderBy(m => m.InwardNumber),
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

    public async Task<MaterialInward?> GetByIdAsync(int id)
    {
        return await _context.MaterialInwards
            .Include(m => m.Warehouse)
            .Include(m => m.Lines)
                .ThenInclude(l => l.Product)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task AddAsync(MaterialInward inward)
    {
        await _context.MaterialInwards.AddAsync(inward);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(MaterialInward inward)
    {
        _context.MaterialInwards.Update(inward);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(MaterialInward inward)
    {
        _context.MaterialInwards.Remove(inward);
        await _context.SaveChangesAsync();
    }
}
