namespace ERPSystem.Application.Features.Audit.Services;

public interface IAuditService
{
    Task LogAsync(
        string userName,
        string action,
        string entityName,
        int entityId);
}