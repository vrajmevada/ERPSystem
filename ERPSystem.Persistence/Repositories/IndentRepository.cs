using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ERPSystem.Persistence.Repositories;

public class IndentRepository : IIndentRepository
{
    private readonly ApplicationDbContext _context;

    public IndentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(List<Indent> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        IQueryable<Indent> query = _context.Indents
            .Include(i => i.RequestingDept)
            .Include(i => i.TargetDept)
            .Include(i => i.Lines)
                .ThenInclude(l => l.Product);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(i => i.VoucherNo.Contains(search)
                || i.Remarks.Contains(search)
                || i.RequestingDept.Name.Contains(search)
                || i.TargetDept.Name.Contains(search));
        }

        query = sortBy?.ToLower() switch
        {
            "voucherno" => query.OrderBy(i => i.VoucherNo),
            "indentdate" => query.OrderBy(i => i.IndentDate),
            "priority" => query.OrderBy(i => i.Priority),
            "status" => query.OrderBy(i => i.Status),
            _ => query.OrderBy(i => i.Id)
        };

        int totalCount = await query.CountAsync();

        if (page.HasValue && pageSize.HasValue)
        {
            query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
        }

        var items = await query.ToListAsync();
        return (items, totalCount);
    }

    public async Task<Indent?> GetByIdAsync(int id)
    {
        return await _context.Indents
            .Include(i => i.RequestingDept)
            .Include(i => i.TargetDept)
            .Include(i => i.Lines)
                .ThenInclude(l => l.Product)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task AddAsync(Indent indent)
    {
        await _context.Indents.AddAsync(indent);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Indent indent)
    {
        _context.Indents.Update(indent);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Indent indent)
    {
        _context.Indents.Remove(indent);
        await _context.SaveChangesAsync();
    }
}