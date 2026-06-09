using ERPSystem.Domain.Enums;

namespace ERPSystem.Application.Features.Sales.DTOs;

public record SalesOrderDto(
    int Id,
    string OrderNumber,
    int CustomerId,
    string CustomerName,
    DateTime OrderDate,
    SalesOrderStatus Status,
    List<SalesOrderItemDto> Items);