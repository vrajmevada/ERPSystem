using ERPSystem.Domain.Entities.Catalog;

namespace ERPSystem.Domain.Entities.Inventory;

public class IndentLine
{
    public int Id { get; set; }
    public int IndentId { get; set; }
    public int LineNo { get; set; }
    public int ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal? EstimatedRate { get; set; }
    public string Notes { get; set; } = string.Empty;

    // Navigation properties
    public Product Product { get; set; } = null!;
}