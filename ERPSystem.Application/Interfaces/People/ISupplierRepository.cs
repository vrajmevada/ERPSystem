using ERPSystem.Domain.Entities.People;

namespace ERPSystem.Application.Interfaces.People;

public interface ISupplierRepository
{
    Task<(List<Supplier> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);

    Task<Supplier?> GetByIdAsync(int id);

    Task AddAsync(Supplier supplier);

    Task UpdateAsync(Supplier supplier);

    Task DeleteAsync(Supplier supplier);
}