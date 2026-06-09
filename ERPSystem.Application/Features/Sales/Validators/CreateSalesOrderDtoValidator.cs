using ERPSystem.Application.Features.Sales.DTOs;
using FluentValidation;

namespace ERPSystem.Application.Features.Sales.Validators;

public class CreateSalesOrderDtoValidator
    : AbstractValidator<CreateSalesOrderDto>
{
    public CreateSalesOrderDtoValidator()
    {
        RuleFor(x => x.CustomerId)
            .GreaterThan(0);

        RuleFor(x => x.WarehouseId)
            .GreaterThan(0);

        RuleFor(x => x.Items)
            .NotEmpty();

        RuleForEach(x => x.Items)
            .SetValidator(
                new CreateSalesOrderItemDtoValidator());
    }
}