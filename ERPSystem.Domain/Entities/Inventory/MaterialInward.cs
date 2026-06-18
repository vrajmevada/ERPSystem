using System;
using System.Collections.Generic;

namespace ERPSystem.Domain.Entities.Inventory;

public class MaterialInward
{
    public int Id { get; set; }
    public string InwardNumber { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public DateTime TransactionDate { get; set; }
    public string Remarks { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft"; // Draft, Approved, Cancelled
    public string InwardType { get; set; } = "Others";
    public string ReferenceNumber { get; set; } = string.Empty;

    public ICollection<MaterialInwardLine> Lines { get; set; } = new List<MaterialInwardLine>();
}
