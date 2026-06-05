using ERPSystem.Application.Features.Catalog.DTOs;
using FluentValidation;
namespace ERPSystem.Application.Features.Catalog.Validators;

public class CreateCategoryDtoValidator : AbstractValidator<CreateCategoryDto>
{
    public CreateCategoryDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Cateogory Name is required.")
            .MaximumLength(100)
            .WithMessage("Category name cannot exceed 100 characters.");
    }
}

