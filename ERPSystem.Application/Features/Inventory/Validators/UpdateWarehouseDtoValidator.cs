using ERPSystem.Application.Features.Inventory.DTOs;
using FluentValidation;

namespace ERPSystem.Application.Features.Inventory.Validators;

public class UpdateWarehouseDtoValidator
    : AbstractValidator<UpdateWarehouseDto>
{
    public UpdateWarehouseDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Location)
            .NotEmpty()
            .MaximumLength(200);
    }
}