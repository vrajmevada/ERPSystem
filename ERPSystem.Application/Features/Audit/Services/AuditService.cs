using ERPSystem.Application.Common;
using ERPSystem.Application.Interfaces.Audit;
using ERPSystem.Domain.Entities.Audit;
using Mapster;

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

    public async Task<PagedResult<AuditLogDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        var (items, totalCount) = await _repository.GetAllAsync(search, sortBy, page, pageSize);

        var dtos = items.Adapt<List<AuditLogDto>>();

        return new PagedResult<AuditLogDto>(
            dtos,
            totalCount,
            page ?? 1,
            pageSize ?? totalCount);
    }
}