using ERPSystem.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

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

    public ICollection<PurchaseOrderItem> Items
    { get; set; } = new List<PurchaseOrderItem>();
}