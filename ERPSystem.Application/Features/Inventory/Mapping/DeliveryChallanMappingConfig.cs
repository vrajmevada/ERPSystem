using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Domain.Entities.Inventory;
using Mapster;

namespace ERPSystem.Application.Features.Inventory.Mapping;

public static class DeliveryChallanMappingConfig
{
    public static void Register()
    {
        TypeAdapterConfig<DeliveryChallan, DeliveryChallanDto>
            .NewConfig()
            .Map(dest => dest.CustomerName, src => src.Customer.Name)
            .Map(dest => dest.FromWarehouseName, src => src.FromWarehouse.Name);

        TypeAdapterConfig<DeliveryChallanLine, DeliveryChallanLineDto>
            .NewConfig()
            .Map(dest => dest.ProductName, src => src.Product.Name);
    }
}
