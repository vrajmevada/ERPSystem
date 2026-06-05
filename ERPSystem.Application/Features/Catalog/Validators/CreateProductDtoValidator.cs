using ERPSystem.Application.Features.Catalog.DTOs;
using FluentValidation;
namespace ERPSystem.Application.Features.Catalog.Validators;

public class CreateProductDtoValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(150);
        RuleFor(x => x.Price)
            .GreaterThan(0);
        RuleFor(x => x.CategoryId)
            .GreaterThan(0);
    }
}

