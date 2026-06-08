namespace ERPSystem.Application.Features.Purchasing.DTOs;

public record CreatePurchaseOrderItemDto(
    int ProductId,
    int Quantity,
    decimal UnitPrice);