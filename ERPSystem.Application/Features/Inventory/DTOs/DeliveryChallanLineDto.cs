namespace ERPSystem.Application.Features.Inventory.DTOs;

public record DeliveryChallanLineDto(
    int Id,
    int DeliveryChallanId,
    int LineNo,
    int ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal DiscountPercentage,
    decimal DiscountAmount,
    decimal TotalAmount,
    string Notes);
