using ERPSystem.Application.Interfaces.Dashboard;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ERPSystem.Persistence.Repositories;

public class DashboardRepository
    : IDashboardRepository
{
    private readonly ApplicationDbContext _context;

    public DashboardRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public Task<int> GetProductCountAsync()
        => _context.Products.CountAsync();

    public Task<int> GetCustomerCountAsync()
        => _context.Customers.CountAsync();

    public Task<int> GetSupplierCountAsync()
        => _context.Suppliers.CountAsync();

    public Task<int> GetWarehouseCountAsync()
        => _context.Warehouses.CountAsync();

    public Task<int> GetPurchaseOrderCountAsync()
        => _context.PurchaseOrders.CountAsync();

    public Task<int> GetSalesOrderCountAsync()
        => _context.SalesOrders.CountAsync();

    public Task<int> GetStockItemCountAsync()
        => _context.StockItems.CountAsync();

    public Task<int> GetLowStockCountAsync()
        => _context.StockItems.CountAsync(
            s => s.Quantity < 10);
}