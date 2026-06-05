using ERPSystem.Application.Features.Inventory.DTOs;
using FluentValidation;

namespace ERPSystem.Application.Features.Inventory.Validators;

public class CreateWarehouseDtoValidator
    : AbstractValidator<CreateWarehouseDto>
{
    public CreateWarehouseDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Location)
            .NotEmpty()
            .MaximumLength(200);
    }
}