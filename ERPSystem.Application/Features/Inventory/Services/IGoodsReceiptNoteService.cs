using ERPSystem.Application.Common;
using ERPSystem.Application.Features.Inventory.DTOs;

namespace ERPSystem.Application.Features.Inventory.Services;

public interface IGoodsReceiptNoteService
{
    Task<PagedResult<GrnDto>> GetAllAsync(string? search = null, int? page = null, int? pageSize = null);
    Task<GrnDto?> GetByIdAsync(int id);
    Task<GrnDto> CreateAsync(CreateGrnDto dto);
    Task ApproveStoreAsync(int id); // The core Store Approval workflow
}