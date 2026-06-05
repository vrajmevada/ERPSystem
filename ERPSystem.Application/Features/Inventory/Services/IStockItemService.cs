using ERPSystem.Application.Features.Inventory.DTOs;

namespace ERPSystem.Application.Features.Inventory.Services;

public interface IStockItemService
{
    Task<IEnumerable<StockItemDto>> GetAllAsync();

    Task<StockItemDto?> GetByIdAsync(int id);

    Task<StockItemDto> CreateAsync(CreateStockItemDto dto);

    Task<bool> DeleteAsync(int id);
}