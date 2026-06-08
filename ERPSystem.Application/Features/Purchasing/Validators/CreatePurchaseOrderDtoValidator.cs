using ERPSystem.Application.Features.Purchasing.DTOs;
using FluentValidation;

namespace ERPSystem.Application.Features.Purchasing.Validators;

public class CreatePurchaseOrderDtoValidator
    : AbstractValidator<CreatePurchaseOrderDto>
{
    public CreatePurchaseOrderDtoValidator()
    {
        RuleFor(x => x.SupplierId)
            .GreaterThan(0);

        RuleFor(x => x.Items)
            .NotEmpty();

        RuleFor(x => x.WarehouseId)
            .GreaterThan(0);

        RuleForEach(x => x.Items)
            .SetValidator(
                new CreatePurchaseOrderItemDtoValidator());
    }
}