using ERPSystem.Application.Features.People.DTOs;

namespace ERPSystem.Application.Features.People.Services;

public interface ICustomerService
{
    Task<IEnumerable<CustomerDto>> GetAllAsync();

    Task<CustomerDto?> GetByIdAsync(int id);

    Task<CustomerDto> CreateAsync(CreateCustomerDto dto);
}