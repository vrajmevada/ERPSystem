using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Domain.Enums;
using ERPSystem.Domain.Entities.People;

namespace ERPSystem.Domain.Entities.Purchasing;

public class PurchaseOrder
{
    public int Id { get; set; }

    public string OrderNumber { get; set; } = string.Empty;

    public int SupplierId { get; set; }

    public DateTime OrderDate { get; set; }

    public PurchaseOrderStatus Status { get; set; }
    = PurchaseOrderStatus.Draft;

    public Supplier Supplier { get; set; } = null!;
    public int WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; }=null!;
    public ICollection<PurchaseOrderItem> Items
    { get; set; } = new List<PurchaseOrderItem>();
}