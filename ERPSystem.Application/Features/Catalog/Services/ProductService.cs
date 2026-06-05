using ERPSystem.Application.Features.Catalog.DTOs;
using ERPSystem.Application.Interfaces.Catalog;
using ERPSystem.Domain.Entities.Catalog;
using Mapster;

namespace ERPSystem.Application.Features.Catalog.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ProductDto>> GetAllAsync()
    {
        var products = await _repository.GetAllAsync();

        return products.Adapt<List<ProductDto>>();
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
    {
        var product = await _repository.GetByIdAsync(id);

        if (product == null)
            return null;

        return product.Adapt<ProductDto>();
    }

    public async Task<ProductDto> CreateAsync(
        CreateProductDto dto)
    {
        var product = dto.Adapt<Product>();

        await _repository.AddAsync(product);

        return product.Adapt<ProductDto>();
    }
}