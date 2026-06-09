namespace ERPSystem.Application.Features.Sales.DTOs;

public record CreateSalesOrderDto(
    int CustomerId,
    int WarehouseId,
    List<CreateSalesOrderItemDto> Items);