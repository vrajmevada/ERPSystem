using ERPSystem.Domain.Entities.Catalog;

namespace ERPSystem.Domain.Entities.Inventory;

public class GoodsReceiptNoteLine
{
    public int Id { get; set; }
    public int GoodsReceiptNoteId { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int OrderedQuantity { get; set; }
    public int ReceivedQuantity { get; set; }
}