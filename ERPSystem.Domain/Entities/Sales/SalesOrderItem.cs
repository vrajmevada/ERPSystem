using ERPSystem.Domain.Entities.Catalog;

namespace ERPSystem.Domain.Entities.Sales;

public class SalesOrderItem
{
    public int Id { get; set; }

    public int SalesOrderId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public Product Product { get; set; } = null!;

    public SalesOrder SalesOrder { get; set; } = null!;
}