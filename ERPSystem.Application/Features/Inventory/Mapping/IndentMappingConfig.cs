using ERPSystem.Application.Features.Inventory.DTOs;
using ERPSystem.Domain.Entities.Inventory;
using Mapster;

namespace ERPSystem.Application.Features.Inventory.Mapping;

public static class IndentMappingConfig
{
    public static void Register()
    {
        // Map the Indent entity to IndentDto
        TypeAdapterConfig<Indent, IndentDto>
            .NewConfig()
            .Map(dest => dest.RequestingDeptName, src => src.RequestingDept.Name)
            .Map(dest => dest.TargetDeptName, src => src.TargetDept.Name);

        // Map the IndentLine entity to IndentLineDto
        TypeAdapterConfig<IndentLine, IndentLineDto>
            .NewConfig()
            .Map(dest => dest.ProductName, src => src.Product.Name);
    }
}