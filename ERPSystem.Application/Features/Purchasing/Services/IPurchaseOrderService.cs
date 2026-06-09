using ERPSystem.Application.Features.Purchasing.DTOs;

namespace ERPSystem.Application.Features.Purchasing.Services;

public interface IPurchaseOrderService
{
    Task<IEnumerable<PurchaseOrderDto>>
        GetAllAsync();

    Task<PurchaseOrderDto?>
        GetByIdAsync(int id);

    Task<PurchaseOrderDto>
        CreateAsync(CreatePurchaseOrderDto dto);
    Task ReceiveAsync(int id);
    Task ApproveAsync(int id);

}