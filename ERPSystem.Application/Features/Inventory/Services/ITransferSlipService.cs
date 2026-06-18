using ERPSystem.Application.Common;
using ERPSystem.Application.Features.Inventory.DTOs;
using System.Threading.Tasks;

namespace ERPSystem.Application.Features.Inventory.Services;

public interface ITransferSlipService
{
    Task<PagedResult<TransferSlipDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<TransferSlipDto?> GetByIdAsync(int id);
    Task<TransferSlipDto> CreateAsync(CreateTransferSlipDto dto);
    Task ShipAsync(int id);
    Task ReceiveAsync(int id);
    Task ShortCloseAsync(int id, ShortCloseTransferSlipDto dto);
}
