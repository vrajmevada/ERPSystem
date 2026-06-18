using ERPSystem.Domain.Entities.Catalog;

namespace ERPSystem.Domain.Entities.Inventory;

public class DeliveryChallanLine
{
    public int Id { get; set; }
    public int DeliveryChallanId { get; set; }
    public int LineNo { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Notes { get; set; } = string.Empty;
}
