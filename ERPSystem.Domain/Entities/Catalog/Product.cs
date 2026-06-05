using System.ComponentModel;
using ERPSystem.Domain.Entities.Inventory;
namespace ERPSystem.Domain.Entities.Catalog;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public ICollection<StockItem> StockItems { get; set; } = new List<StockItem>();
}