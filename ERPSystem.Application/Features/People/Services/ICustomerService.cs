using ERPSystem.Application.Common;
using ERPSystem.Application.Features.People.DTOs;

namespace ERPSystem.Application.Features.People.Services;

public interface ICustomerService
{
    Task<PagedResult<CustomerDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<CustomerDto?> GetByIdAsync(int id);

    Task<CustomerDto> CreateAsync(CreateCustomerDto dto);
    Task<bool> UpdateAsync(
    int id,
    UpdateCustomerDto dto);

    Task<bool> DeleteAsync(int id);
}