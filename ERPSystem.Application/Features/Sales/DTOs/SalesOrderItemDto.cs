namespace ERPSystem.Application.Features.Sales.DTOs;

public record SalesOrderItemDto(
    int ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice);