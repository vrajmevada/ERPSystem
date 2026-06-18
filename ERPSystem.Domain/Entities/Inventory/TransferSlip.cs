using System;
using System.Collections.Generic;

namespace ERPSystem.Domain.Entities.Inventory;

public class TransferSlip
{
    public int Id { get; set; }
    public string SlipNumber { get; set; } = string.Empty; // e.g. TS-Ticks
    public int FromWarehouseId { get; set; }
    public Warehouse FromWarehouse { get; set; } = null!;
    public int ToWarehouseId { get; set; }
    public Warehouse ToWarehouse { get; set; } = null!;
    public DateTime TransferDate { get; set; }
    public string Status { get; set; } = "Draft"; // Draft, Shipped, Approved (Received), Cancelled
    public string Remarks { get; set; } = string.Empty;

    public ICollection<TransferSlipLine> Lines { get; set; } = new List<TransferSlipLine>();
}
