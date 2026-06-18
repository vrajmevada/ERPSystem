namespace ERPSystem.Application.Features.Inventory.DTOs;

public record CreateDeliveryChallanLineDto(
    int ProductId,
    int Quantity,
    decimal UnitPrice,
    decimal DiscountPercentage,
    string Notes);
