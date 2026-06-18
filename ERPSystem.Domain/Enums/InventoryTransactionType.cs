namespace ERPSystem.Domain.Enums;

public enum InventoryTransactionType
{
    Purchase = 1,
    Sale = 2,
    Damage = 3,
    Adjustment = 4,
    TransferOut = 5,
    TransferIn = 6,
    DeliveryChallanOut = 7,
    StockConvertIssue = 8,
    StockConvertReceipt = 9
}