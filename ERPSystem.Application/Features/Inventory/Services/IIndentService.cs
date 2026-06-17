using ERPSystem.Application.Common;
using ERPSystem.Application.Features.Inventory.DTOs;

namespace ERPSystem.Application.Features.Inventory.Services;

public interface IIndentService
{
    Task<PagedResult<IndentDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<IndentDto?> GetByIdAsync(int id);

    Task<IndentDto> CreateAsync(CreateIndentDto dto);

    Task ApproveAsync(int id);

    Task DisapproveAsync(int id);

    Task DeleteAsync(int id);

    Task ShortCloseAsync(int id, ShortCloseIndentDto dto);
}