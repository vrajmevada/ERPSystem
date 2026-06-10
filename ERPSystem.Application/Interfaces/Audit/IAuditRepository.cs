using ERPSystem.Domain.Entities.Audit;

namespace ERPSystem.Application.Interfaces.Audit;

public interface IAuditLogRepository
{
    Task AddAsync(AuditLog auditLog);

    Task<(List<AuditLog> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);
}