namespace ERPSystem.Domain.Entities.Inventory;

public class InventoryTransaction
{
    public int Id { get; set; }
    public int StockItemId {  get; set; }
    public int QuantityChange { get; set; }
    public string TransactionType { get; set; } = string.Empty;
    public DateTime TransactionDate { get; set; }
    public StockItem StockItem { get; set; } = null!;
}
