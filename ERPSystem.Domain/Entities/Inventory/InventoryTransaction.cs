namespace ERPSystem.Domain.Entities.Inventory;

using ERPSystem.Domain.Enums;
public class InventoryTransaction
{
    public int Id { get; set; }
    public int StockItemId {  get; set; }
    public int QuantityChange { get; set; }
    public InventoryTransactionType TransactionType { get; set; }
    public DateTime TransactionDate { get; set; }
    public StockItem StockItem { get; set; } = null!;
}
