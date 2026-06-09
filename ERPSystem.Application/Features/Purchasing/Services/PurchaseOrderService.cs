using ERPSystem.Application.Features.Purchasing.DTOs;
using ERPSystem.Application.Interfaces.Purchasing;
using ERPSystem.Domain.Entities.Purchasing;
using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Application.Exceptions;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Domain.Enums;
using Mapster;

namespace ERPSystem.Application.Features.Purchasing.Services;

public class PurchaseOrderService
    : IPurchaseOrderService
{
    private readonly IPurchaseOrderRepository
        _repository;
    private readonly IStockItemRepository _stockItemRepository;
    private readonly IInventoryTransactionRepository _transactionRepository;
    public PurchaseOrderService(
    IPurchaseOrderRepository repository,
    IStockItemRepository stockItemRepository,
    IInventoryTransactionRepository transactionRepository)
    {
        _repository = repository;
        _stockItemRepository = stockItemRepository;
        _transactionRepository = transactionRepository;
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
    public async Task ReceiveAsync(int id)
    {
        var order = await _repository.GetByIdAsync(id);

        if (order == null)
            throw new BusinessException("Purchase order not found.");

        if (order.Status == PurchaseOrderStatus.Received)
            throw new BusinessException("Purchase order already received.");
        if (order.Status != PurchaseOrderStatus.Approved)
        {
            throw new BusinessException(
                "Purchase order must be approved before receiving.");
        }

        var stockItems = await _stockItemRepository.GetAllAsync();

        foreach (var item in order.Items)
        {
            var stockItem = stockItems.FirstOrDefault(s =>
                s.ProductId == item.ProductId &&
                s.WarehouseId == order.WarehouseId);

            if (stockItem == null)
            {
                stockItem = new StockItem
                {
                    ProductId = item.ProductId,
                    WarehouseId = order.WarehouseId,
                    Quantity = item.Quantity
                };

                await _stockItemRepository.AddAsync(stockItem);
            }
            else
            {
                stockItem.Quantity += item.Quantity;

                await _stockItemRepository.UpdateAsync(stockItem);
            }

            await _transactionRepository.AddAsync(
                new InventoryTransaction
                {
                    StockItemId = stockItem.Id,
                    QuantityChange = item.Quantity,
                    TransactionType = InventoryTransactionType.Purchase,
                    TransactionDate = DateTime.UtcNow
                });
        }

        order.Status = PurchaseOrderStatus.Received;

        await _repository.UpdateAsync(order);
    }
    public async Task ApproveAsync(int id)
    {
        var order = await _repository.GetByIdAsync(id);
        if (order == null)
            throw new BusinessException("Purchase order not found.");
        if (order.Status != PurchaseOrderStatus.Draft)
            throw new BusinessException("Only draft purchase orders can be approved.");
        order.Status = PurchaseOrderStatus.Approved;
        await _repository.UpdateAsync(order);

    }

    public async Task<PurchaseOrderDto>
        CreateAsync(CreatePurchaseOrderDto dto)
    {
        var order = new PurchaseOrder
        {
            SupplierId = dto.SupplierId,
            WarehouseId = dto.WarehouseId,
            OrderDate = DateTime.UtcNow,
            Status = PurchaseOrderStatus.Draft,
            OrderNumber = $"PO-{DateTime.UtcNow.Ticks}",
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