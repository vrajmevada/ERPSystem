using ERPSystem.Application.Features.Sales.DTOs;
using ERPSystem.Application.Interfaces.Sales;
using ERPSystem.Domain.Entities.Sales;
using ERPSystem.Domain.Enums;
using Mapster;

namespace ERPSystem.Application.Features.Sales.Services;

public class SalesOrderService
    : ISalesOrderService
{
    private readonly ISalesOrderRepository
        _repository;

    public SalesOrderService(
        ISalesOrderRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<SalesOrderDto>>
        GetAllAsync()
    {
        var orders =
            await _repository.GetAllAsync();

        return orders.Adapt<List<SalesOrderDto>>();
    }

    public async Task<SalesOrderDto?>
        GetByIdAsync(int id)
    {
        var order =
            await _repository.GetByIdAsync(id);

        if (order == null)
            return null;

        return order.Adapt<SalesOrderDto>();
    }

    public async Task<SalesOrderDto>
        CreateAsync(CreateSalesOrderDto dto)
    {
        var order = new SalesOrder
        {
            CustomerId = dto.CustomerId,
            WarehouseId = dto.WarehouseId,
            OrderDate = DateTime.UtcNow,
            Status = SalesOrderStatus.Draft,
            OrderNumber =
                $"SO-{DateTime.UtcNow.Ticks}",
            Items = dto.Items.Select(i =>
                new SalesOrderItem
                {
                    ProductId = i.ProductId,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
        };

        await _repository.AddAsync(order);

        return order.Adapt<SalesOrderDto>();
    }

    public Task ShipAsync(int id)
    {
        throw new NotImplementedException();
    }
}