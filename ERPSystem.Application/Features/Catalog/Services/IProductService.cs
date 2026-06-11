using ERPSystem.Application.Common;
using ERPSystem.Application.Features.Catalog.DTOs;
namespace ERPSystem.Application.Features.Catalog.Services;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetAllAsync(string? search = null,
                                              string? sortBy = null,
                                              int? page = null,
                                              int? pageSize = null);
    Task<ProductDto?> GetByIdAsync(int id);
    Task<ProductDto> CreateAsync(CreateProductDto dto);
    Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto);
    Task DeleteAsync(int id);
}