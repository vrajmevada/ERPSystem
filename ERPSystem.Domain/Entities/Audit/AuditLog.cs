namespace ERPSystem.Domain.Entities.Audit;

public class AuditLog
{
    public int Id { get; set; }

    public string UserName { get; set; }
        = string.Empty;

    public string Action { get; set; }
        = string.Empty;

    public string EntityName { get; set; }
        = string.Empty;

    public int EntityId { get; set; }
    
    public string? Changes { get; set; }

    public DateTime Timestamp { get; set; }
        = DateTime.UtcNow;
}