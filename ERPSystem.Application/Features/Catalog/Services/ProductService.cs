using ERPSystem.Application.Common;
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

    public async Task<PagedResult<ProductDto>>
    GetAllAsync(
        string? search = null,
        string? sortBy = null,
        int? page = null,
        int? pageSize = null)
    {
        var (items, totalCount) =
            await _repository.GetAllAsync(
                search,
                sortBy,
                page,
                pageSize);

        var dtos = items.Adapt<List<ProductDto>>();

        return new PagedResult<ProductDto>(
            dtos,
            totalCount,
            page ?? 1,
            pageSize ?? totalCount);
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