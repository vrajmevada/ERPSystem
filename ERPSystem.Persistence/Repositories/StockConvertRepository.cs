using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ERPSystem.Persistence.Repositories;

public class StockConvertRepository : IStockConvertRepository
{
    private readonly ApplicationDbContext _context;

    public StockConvertRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(List<StockConvert> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        IQueryable<StockConvert> query = _context.StockConverts
            .Include(s => s.SourceLines)
                .ThenInclude(l => l.Product)
            .Include(s => s.SourceLines)
                .ThenInclude(l => l.Warehouse)
            .Include(s => s.DestinationLines)
                .ThenInclude(l => l.Product)
            .Include(s => s.DestinationLines)
                .ThenInclude(l => l.Warehouse);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(s => s.VoucherNumber.Contains(search)
                || s.Remarks.Contains(search)
                || s.Status.Contains(search));
        }

        query = sortBy?.ToLower() switch
        {
            "vouchernumber" => query.OrderBy(s => s.VoucherNumber),
            "transactiondate" => query.OrderBy(s => s.TransactionDate),
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

    public async Task<StockConvert?> GetByIdAsync(int id)
    {
        return await _context.StockConverts
            .Include(s => s.SourceLines)
                .ThenInclude(l => l.Product)
            .Include(s => s.SourceLines)
                .ThenInclude(l => l.Warehouse)
            .Include(s => s.DestinationLines)
                .ThenInclude(l => l.Product)
            .Include(s => s.DestinationLines)
                .ThenInclude(l => l.Warehouse)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task AddAsync(StockConvert stockConvert)
    {
        await _context.StockConverts.AddAsync(stockConvert);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(StockConvert stockConvert)
    {
        _context.StockConverts.Update(stockConvert);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(StockConvert stockConvert)
    {
        _context.StockConverts.Remove(stockConvert);
        await _context.SaveChangesAsync();
    }
}
