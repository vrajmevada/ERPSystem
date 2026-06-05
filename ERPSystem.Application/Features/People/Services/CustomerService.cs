using ERPSystem.Application.Features.People.DTOs;
using ERPSystem.Application.Interfaces.People;
using ERPSystem.Domain.Entities.People;
using Mapster;

namespace ERPSystem.Application.Features.People.Services;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _repository;

    public CustomerService(ICustomerRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<CustomerDto>> GetAllAsync()
    {
        var customers = await _repository.GetAllAsync();

        return customers.Adapt<List<CustomerDto>>();
    }

    public async Task<CustomerDto?> GetByIdAsync(int id)
    {
        var customer = await _repository.GetByIdAsync(id);

        if (customer == null)
            return null;

        return customer.Adapt<CustomerDto>();
    }

    public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto)
    {
        var customer = dto.Adapt<Customer>();

        await _repository.AddAsync(customer);

        return customer.Adapt<CustomerDto>();
    }
}