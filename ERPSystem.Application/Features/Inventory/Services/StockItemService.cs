using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using Mapster;

namespace ERPSystem.Application.Features.Inventory.Services;

public class StockItemService : IStockItemService
{
    private readonly IStockItemRepository _repository;

    public StockItemService(IStockItemRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<StockItemDto>> GetAllAsync()
    {
        var items = await _repository.GetAllAsync();

        return items.Adapt<List<StockItemDto>>();
    }

    public async Task<StockItemDto?> GetByIdAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);

        if (item == null)
            return null;

        return item.Adapt<StockItemDto>();
    }

    public async Task<StockItemDto> CreateAsync(
        CreateStockItemDto dto)
    {
        var item = dto.Adapt<StockItem>();

        await _repository.AddAsync(item);

        return new StockItemDto(
            item.Id,
            item.ProductId,
            string.Empty,
            item.WarehouseId,
            string.Empty,
            item.Quantity);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);

        if (item == null)
            return false;

        await _repository.DeleteAsync(item);

        return true;
    }
}