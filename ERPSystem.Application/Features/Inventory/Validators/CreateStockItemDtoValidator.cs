using ERPSystem.Application.Features.Inventory.DTOs;
using FluentValidation;

namespace ERPSystem.Application.Features.Inventory.Validators;

public class CreateStockItemDtoValidator
    : AbstractValidator<CreateStockItemDto>
{
    public CreateStockItemDtoValidator()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0);

        RuleFor(x => x.WarehouseId)
            .GreaterThan(0);

        RuleFor(x => x.Quantity)
            .GreaterThanOrEqualTo(0);
    }
}