namespace ERPSystem.Application.Interfaces.Dashboard;

public interface IDashboardRepository
{
    Task<int> GetProductCountAsync();
    Task<int> GetCustomerCountAsync();
    Task<int> GetSupplierCountAsync();
    Task<int> GetWarehouseCountAsync();
    Task<int> GetPurchaseOrderCountAsync();
    Task<int> GetSalesOrderCountAsync();
    Task<int> GetStockItemCountAsync();
    Task<int> GetLowStockCountAsync();
}