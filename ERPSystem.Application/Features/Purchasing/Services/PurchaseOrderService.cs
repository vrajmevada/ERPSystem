using ERPSystem.Application.Features.Purchasing.DTOs;
using ERPSystem.Application.Interfaces.Purchasing;
using ERPSystem.Domain.Entities.Purchasing;
using ERPSystem.Domain.Enums;
using Mapster;

namespace ERPSystem.Application.Features.Purchasing.Services;

public class PurchaseOrderService
    : IPurchaseOrderService
{
    private readonly IPurchaseOrderRepository
        _repository;

    public PurchaseOrderService(
        IPurchaseOrderRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<PurchaseOrderDto>>
        GetAllAsync()
    {
        var orders =
            await _repository.GetAllAsync();

        return orders.Adapt<List<PurchaseOrderDto>>();
    }

    public async Task<PurchaseOrderDto?>
        GetByIdAsync(int id)
    {
        var order =
            await _repository.GetByIdAsync(id);

        if (order == null)
            return null;

        return order.Adapt<PurchaseOrderDto>();
    }

    public async Task<PurchaseOrderDto>
        CreateAsync(CreatePurchaseOrderDto dto)
    {
        var order = new PurchaseOrder
        {
            SupplierId = dto.SupplierId,
            OrderDate = DateTime.UtcNow,
            Status = PurchaseOrderStatus.Draft,
            OrderNumber =
                $"PO-{DateTime.UtcNow.Ticks}",
            Items = dto.Items.Select(i =>
                new PurchaseOrderItem
                {
                    ProductId = i.ProductId,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
        };

        await _repository.AddAsync(order);

        return order.Adapt<PurchaseOrderDto>();
    }
}