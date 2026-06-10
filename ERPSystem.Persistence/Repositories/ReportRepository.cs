using ERPSystem.Application.Features.Reports.DTOs;
using ERPSystem.Application.Interfaces.Reports;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ERPSystem.Persistence.Repositories;

public class ReportRepository
    : IReportRepository
{
    private readonly ApplicationDbContext _context;

    public ReportRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LowStockReportDto>>
        GetLowStockItemsAsync()
    {
        return await _context.StockItems
            .Where(s => s.Quantity < 10)
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Select(s =>
                new LowStockReportDto(
                    s.ProductId,
                    s.Product.Name,
                    s.Warehouse.Name,
                    s.Quantity))
            .ToListAsync();
    }
}