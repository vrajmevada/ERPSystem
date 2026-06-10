using ERPSystem.Application.Common;
using ERPSystem.Application.Features.Purchasing.DTOs;

namespace ERPSystem.Application.Features.Purchasing.Services;

public interface IPurchaseOrderService
{
    Task<PagedResult<PurchaseOrderDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<PurchaseOrderDto?>
        GetByIdAsync(int id);

    Task<PurchaseOrderDto>
        CreateAsync(CreatePurchaseOrderDto dto);
    Task ReceiveAsync(int id);
    Task ApproveAsync(int id);

}