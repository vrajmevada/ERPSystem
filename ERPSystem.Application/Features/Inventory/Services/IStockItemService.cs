using ERPSystem.Application.Common;
using ERPSystem.Application.Features.Inventory.DTOs;

namespace ERPSystem.Application.Features.Inventory.Services;

public interface IStockItemService
{
    Task<PagedResult<StockItemDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<StockItemDto?> GetByIdAsync(int id);

    Task<StockItemDto> CreateAsync(CreateStockItemDto dto);

    Task<bool> DeleteAsync(int id);
}