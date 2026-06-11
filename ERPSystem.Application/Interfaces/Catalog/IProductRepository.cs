using ERPSystem.Domain.Entities.Catalog;
namespace ERPSystem.Application.Interfaces.Catalog;

public interface IProductRepository
{
    Task<(List<Product> Items, int TotalCount)> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null);
    Task<Product?> GetByIdAsync(int id);
    Task AddAsync(Product product);
    Task UpdateAsync(Product product);

    Task DeleteAsync(Product product);
}

