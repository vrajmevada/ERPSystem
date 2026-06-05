using ERPSystem.Domain.Entities.People;

namespace ERPSystem.Application.Interfaces.People;

public interface ICustomerRepository
{
    Task<List<Customer>> GetAllAsync();

    Task<Customer?> GetByIdAsync(int id);

    Task AddAsync(Customer customer);
}