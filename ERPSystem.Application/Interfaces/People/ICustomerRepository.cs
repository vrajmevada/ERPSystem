using ERPSystem.Domain.Entities.People;

namespace ERPSystem.Application.Interfaces.People;

public interface ICustomerRepository
{
    Task<(List<Customer> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<Customer?> GetByIdAsync(int id);

    Task AddAsync(Customer customer);
    Task UpdateAsync(Customer customer);
    Task DeleteAsync(Customer customer);

}