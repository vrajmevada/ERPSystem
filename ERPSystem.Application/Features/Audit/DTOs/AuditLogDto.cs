public record AuditLogDto(
    int Id,
    string UserName,
    string Action,
    string EntityName,
    int EntityId,
    DateTime Timestamp,
    string? Changes);