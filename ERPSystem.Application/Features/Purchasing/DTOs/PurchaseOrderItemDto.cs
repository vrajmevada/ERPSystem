namespace ERPSystem.Application.Features.Purchasing.DTOs;

public record PurchaseOrderItemDto(
    int ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice);