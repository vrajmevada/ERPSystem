using ERPSystem.Application.Common;
using ERPSystem.Application.Features.Inventory.DTOs;
using System.Threading.Tasks;

namespace ERPSystem.Application.Features.Inventory.Services;

public interface IMaterialOutwardService
{
    Task<PagedResult<MaterialOutwardDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<MaterialOutwardDto?> GetByIdAsync(int id);
    Task<MaterialOutwardDto> CreateAsync(CreateMaterialOutwardDto dto);
    Task ApproveAsync(int id);
    Task CancelAsync(int id);
}
