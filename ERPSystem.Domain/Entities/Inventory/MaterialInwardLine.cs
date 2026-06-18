using ERPSystem.Domain.Entities.Catalog;

namespace ERPSystem.Domain.Entities.Inventory;

public class MaterialInwardLine
{
    public int Id { get; set; }
    public int MaterialInwardId { get; set; }
    public int LineNo { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
    public string Remarks { get; set; } = string.Empty;
}
