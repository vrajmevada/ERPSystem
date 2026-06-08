namespace ERPSystem.Application.Features.Purchasing.DTOs;

public record CreatePurchaseOrderDto(
    int SupplierId,
    List<CreatePurchaseOrderItemDto> Items);