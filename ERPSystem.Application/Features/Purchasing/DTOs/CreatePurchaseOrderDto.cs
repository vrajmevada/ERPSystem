namespace ERPSystem.Application.Features.Purchasing.DTOs;

public record CreatePurchaseOrderDto(
    int SupplierId,
    int WarehouseId,
    List<CreatePurchaseOrderItemDto> Items);