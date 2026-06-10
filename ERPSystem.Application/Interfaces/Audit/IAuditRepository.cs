using ERPSystem.Domain.Entities.Audit;

namespace ERPSystem.Application.Interfaces.Audit;

public interface IAuditLogRepository
{
    Task AddAsync(AuditLog auditLog);

    Task<List<AuditLog>> GetAllAsync();
}