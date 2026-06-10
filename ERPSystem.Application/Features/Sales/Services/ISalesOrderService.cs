using ERPSystem.Application.Common;
using ERPSystem.Application.Features.Sales.DTOs;

namespace ERPSystem.Application.Features.Sales.Services;

public interface ISalesOrderService
{
    Task<PagedResult<SalesOrderDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<SalesOrderDto?>
        GetByIdAsync(int id);

    Task<SalesOrderDto>
        CreateAsync(CreateSalesOrderDto dto);

    Task ShipAsync(int id);
    Task ConfirmAsync(int id);
}