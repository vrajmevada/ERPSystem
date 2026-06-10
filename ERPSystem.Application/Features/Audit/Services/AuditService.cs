using ERPSystem.Application.Interfaces.Audit;
using ERPSystem.Domain.Entities.Audit;

namespace ERPSystem.Application.Features.Audit.Services;

public class AuditService : IAuditService
{
    private readonly IAuditLogRepository
        _repository;

    public AuditService(
        IAuditLogRepository repository)
    {
        _repository = repository;
    }

    public async Task LogAsync(
        string userName,
        string action,
        string entityName,
        int entityId)
    {
        await _repository.AddAsync(
            new AuditLog
            {
                UserName = userName,
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                Timestamp = DateTime.UtcNow
            });
    }
}