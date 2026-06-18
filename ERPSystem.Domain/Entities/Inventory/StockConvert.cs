using System;
using System.Collections.Generic;

namespace ERPSystem.Domain.Entities.Inventory;

public class StockConvert
{
    public int Id { get; set; }
    public string VoucherNumber { get; set; } = string.Empty; // e.g. SC-Ticks
    public DateTime TransactionDate { get; set; }
    public string Remarks { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft"; // Draft, Approved, Cancelled

    public ICollection<StockConvertSourceLine> SourceLines { get; set; } = new List<StockConvertSourceLine>();
    public ICollection<StockConvertDestinationLine> DestinationLines { get; set; } = new List<StockConvertDestinationLine>();
}
