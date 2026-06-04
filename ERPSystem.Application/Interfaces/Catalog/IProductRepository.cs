using ERPSystem.Domain.Entities.Catalog;
namespace ERPSystem.Application.Interfaces.Catalog;

public interface IProductRepository
{
    Task<List<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(int id);
    Task AddAsync(Product product);
}

