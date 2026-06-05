using ERPSystem.Application.Features.Inventory.DTOs;

namespace ERPSystem.Application.Features.Inventory.Services;

public interface IWarehouseService
{
    Task<IEnumerable<WarehouseDto>> GetAllAsync();

    Task<WarehouseDto?> GetByIdAsync(int id);

    Task<WarehouseDto> CreateAsync(CreateWarehouseDto dto);

    Task<bool> UpdateAsync(
        int id,
        UpdateWarehouseDto dto);

    Task<bool> DeleteAsync(int id);
}