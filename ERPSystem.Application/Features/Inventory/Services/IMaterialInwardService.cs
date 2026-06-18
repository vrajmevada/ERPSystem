using ERPSystem.Application.Common;
using ERPSystem.Application.Features.Inventory.DTOs;
using System.Threading.Tasks;

namespace ERPSystem.Application.Features.Inventory.Services;

public interface IMaterialInwardService
{
    Task<PagedResult<MaterialInwardDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<MaterialInwardDto?> GetByIdAsync(int id);
    Task<MaterialInwardDto> CreateAsync(CreateMaterialInwardDto dto);
    Task ApproveAsync(int id);
    Task CancelAsync(int id);
}
