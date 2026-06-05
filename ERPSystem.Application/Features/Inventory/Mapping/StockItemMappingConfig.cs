using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Domain.Entities.Inventory;
using Mapster;

namespace ERPSystem.Application.Features.Inventory.Mapping;

public static class StockItemMappingConfig
{
    public static void Register()
    {
        TypeAdapterConfig<StockItem, StockItemDto>
            .NewConfig()
            .Map(dest => dest.ProductName,
                 src => src.Product.Name)
            .Map(dest => dest.WarehouseName,
                 src => src.Warehouse.Name);
    }
}