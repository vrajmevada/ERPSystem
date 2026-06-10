using ERPSystem.Application.Features.Reports.DTOs;
using ERPSystem.Application.Interfaces.Reports;
using ERPSystem.Persistence.Context;
using ERPSystem.Domain.Enums;
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
    public async Task<InventorySummaryDto>
    GetInventorySummaryAsync()
    {
        var totalStockItems =
            await _context.StockItems.CountAsync();

        var totalQuantity =
            await _context.StockItems
                .SumAsync(s => s.Quantity);

        var lowStockItems =
            await _context.StockItems
                .CountAsync(s => s.Quantity < 10);

        return new InventorySummaryDto(
            totalStockItems,
            totalQuantity,
            lowStockItems);
    }
    public async Task<SalesSummaryDto>
    GetSalesSummaryAsync()
    {
        var totalOrders =
            await _context.SalesOrders.CountAsync();

        var draftOrders =
            await _context.SalesOrders
                .CountAsync(s =>
                    s.Status ==
                    SalesOrderStatus.Draft);

        var confirmedOrders =
            await _context.SalesOrders
                .CountAsync(s =>
                    s.Status ==
                    SalesOrderStatus.Confirmed);

        var shippedOrders =
            await _context.SalesOrders
                .CountAsync(s =>
                    s.Status ==
                    SalesOrderStatus.Shipped);

        return new SalesSummaryDto(
            totalOrders,
            draftOrders,
            confirmedOrders,
            shippedOrders);
    }
}