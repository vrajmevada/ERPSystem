namespace ERPSystem.Application.Features.Sales.DTOs;

public record CreateSalesOrderItemDto(
    int ProductId,
    int Quantity,
    decimal UnitPrice);