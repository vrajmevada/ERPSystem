using ERPSystem.Application.Interfaces.Audit;
using ERPSystem.Domain.Entities.Audit;
using ERPSystem.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ERPSystem.Persistence.Repositories;

public class AuditLogRepository
    : IAuditLogRepository
{
    private readonly ApplicationDbContext _context;

    public AuditLogRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(
        AuditLog auditLog)
    {
        await _context.AuditLogs
            .AddAsync(auditLog);

        await _context.SaveChangesAsync();
    }

    public async Task<List<AuditLog>>
        GetAllAsync()
    {
        return await _context.AuditLogs
            .OrderByDescending(
                a => a.Timestamp)
            .ToListAsync();
    }
}