using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Domain.Entities.Inventory;
using Mapster;

namespace ERPSystem.Application.Features.Inventory.Mapping;

public static class GrnMappingConfig
{
    public static void Register()
    {
        TypeAdapterConfig<GoodsReceiptNote, GrnDto>
            .NewConfig()
            .Map(dest => dest.PurchaseOrderNumber, src => src.PurchaseOrder.OrderNumber);

        TypeAdapterConfig<GoodsReceiptNoteLine, GrnLineDto>
            .NewConfig()
            .Map(dest => dest.ProductName, src => src.Product.Name);
    }
}