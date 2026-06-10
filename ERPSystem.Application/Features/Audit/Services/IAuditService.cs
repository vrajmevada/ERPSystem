using ERPSystem.Application.Common;

namespace ERPSystem.Application.Features.Audit.Services;

public interface IAuditService
{
    Task LogAsync(
        string userName,
        string action,
        string entityName,
        int entityId);

    Task<PagedResult<AuditLogDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);
}