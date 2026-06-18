using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ERPSystem.Persistence.Repositories;

public class TransferSlipRepository : ITransferSlipRepository
{
    private readonly ApplicationDbContext _context;

    public TransferSlipRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(List<TransferSlip> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        IQueryable<TransferSlip> query = _context.TransferSlips
            .Include(t => t.FromWarehouse)
            .Include(t => t.ToWarehouse)
            .Include(t => t.Lines)
                .ThenInclude(l => l.Product);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(t => t.SlipNumber.Contains(search) 
                || t.Remarks.Contains(search)
                || t.FromWarehouse.Name.Contains(search)
                || t.ToWarehouse.Name.Contains(search)
                || t.Status.Contains(search));
        }

        query = sortBy?.ToLower() switch
        {
            "slipnumber" => query.OrderBy(t => t.SlipNumber),
            "transferdate" => query.OrderBy(t => t.TransferDate),
            "status" => query.OrderBy(t => t.Status),
            _ => query.OrderBy(t => t.Id)
        };

        int totalCount = await query.CountAsync();

        if (page.HasValue && pageSize.HasValue)
        {
            query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
        }

        var items = await query.ToListAsync();
        return (items, totalCount);
    }

    public async Task<TransferSlip?> GetByIdAsync(int id)
    {
        return await _context.TransferSlips
            .Include(t => t.FromWarehouse)
            .Include(t => t.ToWarehouse)
            .Include(t => t.Lines)
                .ThenInclude(l => l.Product)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task AddAsync(TransferSlip transferSlip)
    {
        await _context.TransferSlips.AddAsync(transferSlip);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(TransferSlip transferSlip)
    {
        _context.TransferSlips.Update(transferSlip);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(TransferSlip transferSlip)
    {
        _context.TransferSlips.Remove(transferSlip);
        await _context.SaveChangesAsync();
    }
}
