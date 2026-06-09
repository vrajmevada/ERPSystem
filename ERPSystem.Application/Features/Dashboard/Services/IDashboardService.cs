using ERPSystem.Application.Features.Dashboard.DTOs;

namespace ERPSystem.Application.Features.Dashboard.Services;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync();
}