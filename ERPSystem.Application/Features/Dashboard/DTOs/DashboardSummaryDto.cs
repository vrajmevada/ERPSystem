namespace ERPSystem.Application.Features.Dashboard.DTOs;

public record DashboardSummaryDto(
    int TotalProducts,
    int TotalCustomers,
    int TotalSuppliers,
    int TotalWarehouses,
    int TotalPurchaseOrders,
    int TotalSalesOrders,
    int TotalStockItems,
    int LowStockItems);