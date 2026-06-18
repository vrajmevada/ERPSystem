using ERPSystem.Application.Common;
using ERPSystem.Application.Features.Inventory.DTOs;
using System.Threading.Tasks;

namespace ERPSystem.Application.Features.Inventory.Services;

public interface IOpeningStockService
{
    Task<PagedResult<OpeningStockDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<OpeningStockDto?> GetByIdAsync(int id);
    Task<OpeningStockDto> CreateAsync(CreateOpeningStockDto dto);
    Task<bool> DeleteAsync(int id);
}
