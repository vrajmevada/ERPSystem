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
    public async Task<PurchaseSummaryDto>
    GetPurchaseSummaryAsync()
    {
        var totalOrders =
            await _context.PurchaseOrders.CountAsync();

        var draftOrders =
            await _context.PurchaseOrders
                .CountAsync(p =>
                    p.Status ==
                    PurchaseOrderStatus.Draft);

        var approvedOrders =
            await _context.PurchaseOrders
                .CountAsync(p =>
                    p.Status ==
                    PurchaseOrderStatus.Approved);

        var receivedOrders =
            await _context.PurchaseOrders
                .CountAsync(p =>
                    p.Status ==
                    PurchaseOrderStatus.Received);

        return new PurchaseSummaryDto(
            totalOrders,
            draftOrders,
            approvedOrders,
            receivedOrders);
    }

    public async Task<List<StockReportDto>> GetStockReportAsync(int? warehouseId, int? productId)
    {
        var query = _context.StockItems.AsNoTracking();

        if (warehouseId.HasValue)
        {
            query = query.Where(s => s.WarehouseId == warehouseId);
        }

        if (productId.HasValue)
        {
            query = query.Where(s => s.ProductId == productId);
        }

        return await query
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Select(s => new StockReportDto(
                s.ProductId,
                s.Product.Name,
                s.WarehouseId,
                s.Warehouse.Name,
                s.Quantity
            ))
            .ToListAsync();
    }

    public async Task<List<StockSummaryReportDto>> GetStockSummaryReportAsync(int? productId)
    {
        var query = _context.StockItems.AsNoTracking();

        if (productId.HasValue)
        {
            query = query.Where(s => s.ProductId == productId);
        }

        return await query
            .Include(s => s.Product)
            .GroupBy(s => new { s.ProductId, s.Product.Name })
            .Select(g => new StockSummaryReportDto(
                g.Key.ProductId,
                g.Key.Name,
                g.Sum(s => s.Quantity)
            ))
            .ToListAsync();
    }

    public async Task<List<TrackingDetailReportDto>> GetTrackingDetailReportAsync(int? productId, int? warehouseId, DateTime? startDate, DateTime? endDate)
    {
        var query = _context.InventoryTransactions.AsNoTracking();

        if (productId.HasValue)
        {
            query = query.Where(t => t.StockItem.ProductId == productId);
        }

        if (warehouseId.HasValue)
        {
            query = query.Where(t => t.StockItem.WarehouseId == warehouseId);
        }

        if (startDate.HasValue)
        {
            query = query.Where(t => t.TransactionDate >= startDate);
        }

        if (endDate.HasValue)
        {
            query = query.Where(t => t.TransactionDate <= endDate);
        }

        var txs = await query
            .Include(t => t.StockItem.Product)
            .Include(t => t.StockItem.Warehouse)
            .OrderBy(t => t.TransactionDate)
            .ThenBy(t => t.Id)
            .ToListAsync();

        var result = new List<TrackingDetailReportDto>();
        int runningTotal = 0;

        foreach (var t in txs)
        {
            runningTotal += t.QuantityChange;
            result.Add(new TrackingDetailReportDto(
                t.Id,
                t.TransactionDate,
                t.StockItem.ProductId,
                t.StockItem.Product.Name,
                t.StockItem.WarehouseId,
                t.StockItem.Warehouse.Name,
                t.QuantityChange,
                t.TransactionType.ToString(),
                runningTotal
            ));
        }

        return result;
    }
}