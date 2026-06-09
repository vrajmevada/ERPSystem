using ERPSystem.Application.Features.Sales.DTOs;
using FluentValidation;

namespace ERPSystem.Application.Features.Sales.Validators;

public class CreateSalesOrderItemDtoValidator
    : AbstractValidator<CreateSalesOrderItemDto>
{
    public CreateSalesOrderItemDtoValidator()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0);

        RuleFor(x => x.Quantity)
            .GreaterThan(0);

        RuleFor(x => x.UnitPrice)
            .GreaterThan(0);
    }
}