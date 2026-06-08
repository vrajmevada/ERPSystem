using ERPSystem.Domain.Entities.Catalog;

namespace ERPSystem.Domain.Entities.Inventory;

public class StockItem
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public int WarehouseId { get; set; }

    public int Quantity { get; set; }

    public Product Product { get; set; } = null!;

    public Warehouse Warehouse { get; set; } = null!;
    public ICollection<InventoryTransaction> Transactions { get; set; } = new List<InventoryTransaction>();
}