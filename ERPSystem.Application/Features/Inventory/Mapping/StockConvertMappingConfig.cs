using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Domain.Entities.Inventory;
using Mapster;

namespace ERPSystem.Application.Features.Inventory.Mapping;

public static class StockConvertMappingConfig
{
    public static void Register()
    {
        TypeAdapterConfig<StockConvert, StockConvertDto>
            .NewConfig();

        TypeAdapterConfig<StockConvertSourceLine, StockConvertSourceLineDto>
            .NewConfig()
            .Map(dest => dest.ProductName, src => src.Product.Name)
            .Map(dest => dest.WarehouseName, src => src.Warehouse.Name);

        TypeAdapterConfig<StockConvertDestinationLine, StockConvertDestinationLineDto>
            .NewConfig()
            .Map(dest => dest.ProductName, src => src.Product.Name)
            .Map(dest => dest.WarehouseName, src => src.Warehouse.Name);
    }
}
