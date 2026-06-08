using ERPSystem.Application.Features.Inventory.DTOs;

namespace ERPSystem.Application.Features.Inventory.Services;

public interface IInventoryTransactionService
{
    Task<IEnumerable<InventoryTransactionDto>> GetAllAsync();

    Task<InventoryTransactionDto?> GetByIdAsync(int id);

    Task<InventoryTransactionDto> CreateAsync(
        CreateInventoryTransactionDto dto);
}