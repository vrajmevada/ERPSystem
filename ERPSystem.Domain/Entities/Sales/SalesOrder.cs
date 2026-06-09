using ERPSystem.Domain.Entities.People;
using ERPSystem.Domain.Enums;

namespace ERPSystem.Domain.Entities.Sales;

public class SalesOrder
{
    public int Id { get; set; }

    public string OrderNumber { get; set; } = string.Empty;

    public int CustomerId { get; set; }

    public int WarehouseId { get; set; }

    public DateTime OrderDate { get; set; }

    public SalesOrderStatus Status { get; set; }
        = SalesOrderStatus.Draft;

    public Customer Customer { get; set; } = null!;

    public ICollection<SalesOrderItem> Items
    { get; set; } = new List<SalesOrderItem>();
}