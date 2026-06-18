using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Domain.Entities.Inventory;
using Mapster;

namespace ERPSystem.Application.Features.Inventory.Mapping;

public static class TransferSlipMappingConfig
{
    public static void Register()
    {
        TypeAdapterConfig<TransferSlip, TransferSlipDto>
            .NewConfig()
            .Map(dest => dest.FromWarehouseName, src => src.FromWarehouse.Name)
            .Map(dest => dest.ToWarehouseName, src => src.ToWarehouse.Name);

        TypeAdapterConfig<TransferSlipLine, TransferSlipLineDto>
            .NewConfig()
            .Map(dest => dest.ProductName, src => src.Product.Name);
    }
}
