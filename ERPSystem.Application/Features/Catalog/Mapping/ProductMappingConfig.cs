using ERPSystem.Application.Features.Catalog.DTOs;
using ERPSystem.Domain.Entities.Catalog;
using Mapster;
namespace ERPSystem.Application.Features.Catalog.Mapping;

public static class ProductMappingConfig
{
    public static void Register()
    {
        TypeAdapterConfig<Product, ProductDto>
            .NewConfig()
            .Map(
                dest => dest.CategoryName,
                src => src.Category.Name);
    }
}