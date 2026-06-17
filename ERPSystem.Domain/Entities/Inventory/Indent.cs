using ERPSystem.Domain.Entities.People;

namespace ERPSystem.Domain.Entities.Inventory;

public class Indent
{
    public int Id { get; set; }
    public string VoucherNo { get; set; } = string.Empty;
    public int RequestingDeptId { get; set; }
    public int TargetDeptId { get; set; }
    public DateTime IndentDate { get; set; }
    public string Remarks { get; set; } = string.Empty;
    public string Priority { get; set; } = "Medium"; // High, Medium, Low
    public string Status { get; set; } = "Pending"; // Pending, Approved, Disapproved

    // Navigation properties
    public Department RequestingDept { get; set; } = null!;
    public Department TargetDept { get; set; } = null!;
    
    public ICollection<IndentLine> Lines { get; set; } = new List<IndentLine>();
}
