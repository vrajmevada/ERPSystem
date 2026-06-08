using ERPSystem.Application.Features.Purchasing.DTOs;
using FluentValidation;

namespace ERPSystem.Application.Features.Purchasing.Validators;

public class CreatePurchaseOrderItemDtoValidator
    : AbstractValidator<CreatePurchaseOrderItemDto>
{
    public CreatePurchaseOrderItemDtoValidator()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0);

        RuleFor(x => x.Quantity)
            .GreaterThan(0);

        RuleFor(x => x.UnitPrice)
            .GreaterThan(0);
    }
}