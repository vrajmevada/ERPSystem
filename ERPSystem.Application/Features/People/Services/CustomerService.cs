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
    public async Task<bool> UpdateAsync(
    int id,
    UpdateCustomerDto dto)
    {
        var customer = await _repository.GetByIdAsync(id);

        if (customer == null)
            return false;

        customer.Name = dto.Name;
        customer.Email = dto.Email;
        customer.PhoneNumber = dto.PhoneNumber;
        customer.Address = dto.Address;

        await _repository.UpdateAsync(customer);

        return true;
    }
    public async Task<bool> DeleteAsync(int id)
    {
        var customer = await _repository.GetByIdAsync(id);

        if (customer == null)
            return false;

        await _repository.DeleteAsync(customer);

        return true;
    }
}