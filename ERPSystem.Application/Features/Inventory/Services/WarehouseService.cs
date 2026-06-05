using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Domain.Entities.Inventory;
using Mapster;

namespace ERPSystem.Application.Features.Inventory.Services;

public class WarehouseService : IWarehouseService
{
    private readonly IWarehouseRepository _repository;

    public WarehouseService(IWarehouseRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<WarehouseDto>> GetAllAsync()
    {
        var warehouses = await _repository.GetAllAsync();

        return warehouses.Adapt<List<WarehouseDto>>();
    }

    public async Task<WarehouseDto?> GetByIdAsync(int id)
    {
        var warehouse = await _repository.GetByIdAsync(id);

        if (warehouse == null)
            return null;

        return warehouse.Adapt<WarehouseDto>();
    }

    public async Task<WarehouseDto> CreateAsync(
        CreateWarehouseDto dto)
    {
        var warehouse = dto.Adapt<Warehouse>();

        await _repository.AddAsync(warehouse);

        return warehouse.Adapt<WarehouseDto>();
    }

    public async Task<bool> UpdateAsync(
        int id,
        UpdateWarehouseDto dto)
    {
        var warehouse = await _repository.GetByIdAsync(id);

        if (warehouse == null)
            return false;

        warehouse.Name = dto.Name;
        warehouse.Location = dto.Location;

        await _repository.UpdateAsync(warehouse);

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var warehouse = await _repository.GetByIdAsync(id);

        if (warehouse == null)
            return false;

        await _repository.DeleteAsync(warehouse);

        return true;
    }
}