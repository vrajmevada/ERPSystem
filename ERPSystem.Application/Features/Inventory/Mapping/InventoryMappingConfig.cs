using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Domain.Entities.Inventory;
using Mapster;

namespace ERPSystem.Application.Features.Inventory.Mapping;

public static class InventoryMappingConfig
{
    public static void Register()
    {
        TypeAdapterConfig<OpeningStock, OpeningStockDto>
            .NewConfig()
            .Map(dest => dest.ProductName, src => src.Product.Name)
            .Map(dest => dest.WarehouseName, src => src.Warehouse.Name);

        TypeAdapterConfig<MaterialInward, MaterialInwardDto>
            .NewConfig()
            .Map(dest => dest.WarehouseName, src => src.Warehouse.Name);

        TypeAdapterConfig<MaterialInwardLine, MaterialInwardLineDto>
            .NewConfig()
            .Map(dest => dest.ProductName, src => src.Product.Name);

        TypeAdapterConfig<MaterialOutward, MaterialOutwardDto>
            .NewConfig()
            .Map(dest => dest.WarehouseName, src => src.Warehouse.Name);

        TypeAdapterConfig<MaterialOutwardLine, MaterialOutwardLineDto>
            .NewConfig()
            .Map(dest => dest.ProductName, src => src.Product.Name);
    }
}
