using ERPSystem.Domain.Entities.Purchasing;

namespace ERPSystem.Domain.Entities.Inventory;

public class GoodsReceiptNote
{
    public int Id { get; set; }
    public string GrnNumber { get; set; } = string.Empty; // e.g. GRN-Ticks
    public int PurchaseOrderId { get; set; }
    public PurchaseOrder PurchaseOrder { get; set; } = null!;
    public DateTime ReceivedDate { get; set; }
    public string Remarks { get; set; } = string.Empty;
    public string Status { get; set; } = "PendingStoreApproval"; // PendingStoreApproval, Approved, Rejected

    public ICollection<GoodsReceiptNoteLine> Lines { get; set; } = new List<GoodsReceiptNoteLine>();
}