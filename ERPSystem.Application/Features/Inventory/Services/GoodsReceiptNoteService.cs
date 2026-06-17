using ERPSystem.Application.Common;
using ERPSystem.Application.Exceptions;
using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Application.Interfaces;
using ERPSystem.Application.Interfaces.Inventory;
using ERPSystem.Application.Interfaces.Purchasing;
using ERPSystem.Domain.Entities.Inventory;
using ERPSystem.Domain.Enums;
using Mapster;

namespace ERPSystem.Application.Features.Inventory.Services;

public class GoodsReceiptNoteService : IGoodsReceiptNoteService
{
    private readonly IGoodsReceiptNoteRepository _grnRepository;
    private readonly IPurchaseOrderRepository _poRepository;
    private readonly IStockItemRepository _stockItemRepository;
    private readonly IInventoryTransactionRepository _transactionRepository;
    private readonly ITransactionManager _transactionManager;

    public GoodsReceiptNoteService(
        IGoodsReceiptNoteRepository grnRepository,
        IPurchaseOrderRepository poRepository,
        IStockItemRepository stockItemRepository,
        IInventoryTransactionRepository transactionRepository,
        ITransactionManager transactionManager)
    {
        _grnRepository = grnRepository;
        _poRepository = poRepository;
        _stockItemRepository = stockItemRepository;
        _transactionRepository = transactionRepository;
        _transactionManager = transactionManager;
    }

    public async Task<PagedResult<GrnDto>> GetAllAsync(string? search = null, int? page = null, int? pageSize = null)
    {
        var (items, totalCount) = await _grnRepository.GetAllAsync(search, page, pageSize);
        var dtos = items.Adapt<List<GrnDto>>();
        return new PagedResult<GrnDto>(dtos, totalCount, page ?? 1, pageSize ?? totalCount);
    }

    public async Task<GrnDto?> GetByIdAsync(int id)
    {
        var grn = await _grnRepository.GetByIdAsync(id);
        return grn?.Adapt<GrnDto>();
    }

    public async Task<GrnDto> CreateAsync(CreateGrnDto dto)
    {
        // 1. Validate PO exists and is approved (so it is ready for receipt)
        var po = await _poRepository.GetByIdAsync(dto.PurchaseOrderId);
        if (po == null) throw new BusinessException("Purchase Order not found.");
        if (po.Status != PurchaseOrderStatus.Approved)
            throw new BusinessException("Purchase Order must be Approved before creating a GRN.");

        // 2. Map and generate Grn header
        var grn = new GoodsReceiptNote
        {
            GrnNumber = $"GRN-{DateTime.UtcNow.Ticks}",
            PurchaseOrderId = dto.PurchaseOrderId,
            ReceivedDate = DateTime.UtcNow,
            Remarks = dto.Remarks,
            Status = "PendingStoreApproval"
        };

        // 3. Map line details
        foreach (var line in dto.Lines)
        {
            grn.Lines.Add(new GoodsReceiptNoteLine
            {
                ProductId = line.ProductId,
                OrderedQuantity = line.OrderedQuantity,
                ReceivedQuantity = line.ReceivedQuantity
            });
        }

        await _grnRepository.AddAsync(grn);

        var savedGrn = await _grnRepository.GetByIdAsync(grn.Id);
        return savedGrn.Adapt<GrnDto>();
    }

    public async Task ApproveStoreAsync(int id)
    {
        // Execute inside a database transaction to guarantee consistency
        using var tx = await _transactionManager.BeginTransactionAsync();
        try
        {
            // 1. Fetch GRN and validate status
            var grn = await _grnRepository.GetByIdAsync(id);
            if (grn == null) throw new BusinessException("GRN not found.");
            if (grn.Status != "PendingStoreApproval")
                throw new BusinessException("GRN is already approved or rejected.");

            // 2. Fetch parent Purchase Order and target Warehouse
            var po = await _poRepository.GetByIdAsync(grn.PurchaseOrderId);
            if (po == null) throw new BusinessException("Purchase Order not found.");

            // 3. Retrieve all stock items to find target warehouse matches
            var (stockItems, _) = await _stockItemRepository.GetAllAsync();

            // 4. Update stock quantities and log ledger records
            foreach (var line in grn.Lines)
            {
                var stockItem = stockItems.FirstOrDefault(s =>
                    s.ProductId == line.ProductId &&
                    s.WarehouseId == po.WarehouseId);

                if (stockItem == null)
                {
                    // If no inventory record exists in that warehouse, create one
                    stockItem = new StockItem
                    {
                        ProductId = line.ProductId,
                        WarehouseId = po.WarehouseId,
                        Quantity = line.ReceivedQuantity
                    };
                    await _stockItemRepository.AddAsync(stockItem);
                }
                else
                {
                    // Add received quantity to inventory
                    stockItem.Quantity += line.ReceivedQuantity;
                    await _stockItemRepository.UpdateAsync(stockItem);
                }

                // Log audit trail in the inventory transaction ledger
                await _transactionRepository.AddAsync(new InventoryTransaction
                {
                    StockItemId = stockItem.Id,
                    QuantityChange = line.ReceivedQuantity,
                    TransactionType = InventoryTransactionType.Purchase,
                    TransactionDate = DateTime.UtcNow
                });
            }

            // 5. Update Statuses
            grn.Status = "Approved";
            po.Status = PurchaseOrderStatus.Received; // Mark PO as Received/Closed

            await _grnRepository.UpdateAsync(grn);
            await _poRepository.UpdateAsync(po);

            await _transactionManager.CommitAsync();
        }
        catch
        {
            await _transactionManager.RollbackAsync();
            throw;
        }
    }
}