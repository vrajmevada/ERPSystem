using ERPSystem.Application.Features.Inventory.DTOs;
using FluentValidation;

namespace ERPSystem.Application.Features.Inventory.Validators;

public class CreateIndentDtoValidator : AbstractValidator<CreateIndentDto>
{
    public CreateIndentDtoValidator()
    {
        RuleFor(x => x.RequestingDeptId)
            .GreaterThan(0)
            .WithMessage("Requesting Department is required.");

        RuleFor(x => x.TargetDeptId)
            .GreaterThan(0)
            .WithMessage("Target Department is required.");

        RuleFor(x => x.Priority)
            .NotEmpty()
            .Must(x => x == "High" || x == "Medium" || x == "Low")
            .WithMessage("Priority must be High, Medium, or Low.");

        RuleFor(x => x.Lines)
            .NotEmpty()
            .WithMessage("Indent must contain at least one line item.");

        RuleForEach(x => x.Lines)
            .SetValidator(new CreateIndentLineDtoValidator());
    }
}

public class CreateIndentLineDtoValidator : AbstractValidator<CreateIndentLineDto>
{
    public CreateIndentLineDtoValidator()
    {
        RuleFor(x => x.ProductId)
            .GreaterThan(0)
            .WithMessage("Valid Product is required.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than zero.");

        RuleFor(x => x.EstimatedRate)
            .GreaterThan(0)
            .When(x => x.EstimatedRate.HasValue)
            .WithMessage("Estimated rate must be greater than zero if provided.");
    }
}