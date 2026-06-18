using System;
using System.Collections.Generic;
using ERPSystem.Domain.Entities.People;

namespace ERPSystem.Domain.Entities.Inventory;

public class DeliveryChallan
{
    public int Id { get; set; }
    public string ChallanNumber { get; set; } = string.Empty; // e.g. DC-Ticks
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public int FromWarehouseId { get; set; }
    public Warehouse FromWarehouse { get; set; } = null!;
    public DateTime ChallanDate { get; set; }
    public string Status { get; set; } = "Draft"; // Draft, Shipped, Cancelled
    public string Remarks { get; set; } = string.Empty;

    // Dispatch & Logistics details
    public string DispatchDocNo { get; set; } = string.Empty;
    public string DispatchThrough { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public string TermsOfDelivery { get; set; } = string.Empty;
    public string LRNo { get; set; } = string.Empty;
    public DateTime? LRDt { get; set; }
    public string TransporterName { get; set; } = string.Empty;
    public bool IsLRReceived { get; set; }
    public string ContactPerson { get; set; } = string.Empty;

    public ICollection<DeliveryChallanLine> Lines { get; set; } = new List<DeliveryChallanLine>();
}
