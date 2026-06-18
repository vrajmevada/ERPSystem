using ERPSystem.Application.Common;
using ERPSystem.Application.Features.Inventory.DTOs;
using System.Threading.Tasks;

namespace ERPSystem.Application.Features.Inventory.Services;

public interface IDeliveryChallanService
{
    Task<PagedResult<DeliveryChallanDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<DeliveryChallanDto?> GetByIdAsync(int id);
    Task<DeliveryChallanDto> CreateAsync(CreateDeliveryChallanDto dto);
    Task ShipAsync(int id);
    Task CancelAsync(int id);
}
