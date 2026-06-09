using ERPSystem.Application.Features.Sales.DTOs;
using ERPSystem.Application.Interfaces.Sales;
using ERPSystem.Domain.Entities.Sales;
using ERPSystem.Domain.Enums;
using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Application.Exceptions;
using ERPSystem.Domain.Entities.Inventory;
using Mapster;

namespace ERPSystem.Application.Features.Sales.Services;

public class SalesOrderService
    : ISalesOrderService
{
    private readonly ISalesOrderRepository
        _repository;
    private readonly IStockItemRepository _stockItemRepository;
    private readonly IInventoryTransactionRepository _transactionRepository;

    public SalesOrderService(
    ISalesOrderRepository repository,
    IStockItemRepository stockItemRepository,
    IInventoryTransactionRepository transactionRepository)
    {
        _repository = repository;
        _stockItemRepository = stockItemRepository;
        _transactionRepository = transactionRepository;
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

    public async Task ShipAsync(int id)
    {
        var order = await _repository.GetByIdAsync(id);

        if (order == null)
            throw new BusinessException("Sales order not found.");

        if (order.Status == SalesOrderStatus.Shipped)
            throw new BusinessException(
                "Sales order already shipped.");

        var stockItems = await _stockItemRepository.GetAllAsync();

        foreach (var item in order.Items)
        {
            var stockItem = stockItems.FirstOrDefault(s =>
                s.ProductId == item.ProductId &&
                s.WarehouseId == order.WarehouseId);

            if (stockItem == null)
                throw new BusinessException(
                    $"No stock found for product {item.ProductId}.");

            if (stockItem.Quantity < item.Quantity)
                throw new BusinessException(
                    $"Insufficient stock for product {item.ProductId}.");

            stockItem.Quantity -= item.Quantity;

            await _stockItemRepository.UpdateAsync(stockItem);

            await _transactionRepository.AddAsync(
                new InventoryTransaction
                {
                    StockItemId = stockItem.Id,
                    QuantityChange = -item.Quantity,
                    TransactionType = InventoryTransactionType.Sale,
                    TransactionDate = DateTime.UtcNow
                });
        }

        order.Status = SalesOrderStatus.Shipped;

        await _repository.UpdateAsync(order);
    }
}