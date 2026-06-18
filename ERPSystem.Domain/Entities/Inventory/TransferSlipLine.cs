using ERPSystem.Domain.Entities.Catalog;

namespace ERPSystem.Domain.Entities.Inventory;

public class TransferSlipLine
{
    public int Id { get; set; }
    public int TransferSlipId { get; set; }
    public int LineNo { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
    public int ShortClosedQuantity { get; set; } = 0;
    public string Notes { get; set; } = string.Empty;
}
