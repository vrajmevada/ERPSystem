using ERPSystem.Application.Features.Sales.DTOs;

namespace ERPSystem.Application.Features.Sales.Services;

public interface ISalesOrderService
{
    Task<IEnumerable<SalesOrderDto>>
        GetAllAsync();

    Task<SalesOrderDto?>
        GetByIdAsync(int id);

    Task<SalesOrderDto>
        CreateAsync(CreateSalesOrderDto dto);

    Task ShipAsync(int id);
    Task ConfirmAsync(int id);
}