using ERPSystem.Application.Common;
using ERPSystem.Application.Features.Inventory.DTOs;
using System.Threading.Tasks;

namespace ERPSystem.Application.Features.Inventory.Services;

public interface IStockConvertService
{
    Task<PagedResult<StockConvertDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<StockConvertDto?> GetByIdAsync(int id);
    Task<StockConvertDto> CreateAsync(CreateStockConvertDto dto);
    Task ApproveAsync(int id);
    Task CancelAsync(int id);
}
