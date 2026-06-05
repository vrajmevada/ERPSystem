using ERPSystem.Application.Features.Catalog.DTOs;
namespace ERPSystem.Application.Features.Catalog.Services;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllAsync();
    Task<ProductDto?> GetByIdAsync(int id);
    Task<ProductDto> CreateAsync(CreateProductDto dto);
}