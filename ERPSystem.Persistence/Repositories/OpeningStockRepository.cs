using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ERPSystem.Persistence.Repositories;

public class OpeningStockRepository : IOpeningStockRepository
{
    private readonly ApplicationDbContext _context;

    public OpeningStockRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(List<OpeningStock> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        IQueryable<OpeningStock> query = _context.OpeningStocks
            .Include(o => o.Product)
            .Include(o => o.Warehouse);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(o => o.Product.Name.Contains(search)
                || o.Warehouse.Name.Contains(search)
                || o.Remarks.Contains(search));
        }

        query = sortBy?.ToLower() switch
        {
            "product" => query.OrderBy(o => o.Product.Name),
            "warehouse" => query.OrderBy(o => o.Warehouse.Name),
            "transactiondate" => query.OrderBy(o => o.TransactionDate),
            _ => query.OrderBy(o => o.Id)
        };

        int totalCount = await query.CountAsync();

        if (page.HasValue && pageSize.HasValue)
        {
            query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
        }

        var items = await query.ToListAsync();
        return (items, totalCount);
    }

    public async Task<OpeningStock?> GetByIdAsync(int id)
    {
        return await _context.OpeningStocks
            .Include(o => o.Product)
            .Include(o => o.Warehouse)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task AddAsync(OpeningStock openingStock)
    {
        await _context.OpeningStocks.AddAsync(openingStock);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(OpeningStock openingStock)
    {
        _context.OpeningStocks.Update(openingStock);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(OpeningStock openingStock)
    {
        _context.OpeningStocks.Remove(openingStock);
        await _context.SaveChangesAsync();
    }
}
