using ERPSystem.Domain.Entities.People;

namespace ERPSystem.Application.Interfaces.People;

public interface ISupplierRepository
{
    Task<List<Supplier>> GetAllAsync();

    Task<Supplier?> GetByIdAsync(int id);

    Task AddAsync(Supplier supplier);

    Task UpdateAsync(Supplier supplier);

    Task DeleteAsync(Supplier supplier);
}