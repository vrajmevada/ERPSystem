using ERPSystem.Domain.Entities.Catalog;
using System;
using System.Collections.Generic;
using System.Text;

namespace ERPSystem.Domain.Entities.Purchasing;

public class PurchaseOrderItem
{
    public int Id { get; set; }

    public int PurchaseOrderId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public Product Product { get; set; } = null!;

    public PurchaseOrder PurchaseOrder { get; set; } = null!;
}
