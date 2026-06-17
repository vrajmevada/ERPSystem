using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ERPSystem.Persistence.Repositories;

public class GoodsReceiptNoteRepository : IGoodsReceiptNoteRepository
{
    private readonly ApplicationDbContext _context;

    public GoodsReceiptNoteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(List<GoodsReceiptNote> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        int? page = null,
        int? pageSize = null)
    {
        IQueryable<GoodsReceiptNote> query = _context.GoodsReceiptNotes
            .Include(g => g.PurchaseOrder)
            .Include(g => g.Lines)
                .ThenInclude(l => l.Product);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(g => g.GrnNumber.Contains(search)
                || g.PurchaseOrder.OrderNumber.Contains(search));
        }

        int totalCount = await query.CountAsync();

        if (page.HasValue && pageSize.HasValue)
        {
            query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
        }

        var items = await query.ToListAsync();
        return (items, totalCount);
    }

    public async Task<GoodsReceiptNote?> GetByIdAsync(int id)
    {
        return await _context.GoodsReceiptNotes
            .Include(g => g.PurchaseOrder)
            .Include(g => g.Lines)
                .ThenInclude(l => l.Product)
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    public async Task AddAsync(GoodsReceiptNote grn)
    {
        await _context.GoodsReceiptNotes.AddAsync(grn);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(GoodsReceiptNote grn)
    {
        _context.GoodsReceiptNotes.Update(grn);
        await _context.SaveChangesAsync();
    }
}