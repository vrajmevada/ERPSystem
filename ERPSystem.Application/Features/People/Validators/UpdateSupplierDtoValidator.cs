using ERPSystem.Application.Features.People.DTOs;
using FluentValidation;

namespace ERPSystem.Application.Features.People.Validators;

public class UpdateSupplierDtoValidator
    : AbstractValidator<UpdateSupplierDto>
{
    public UpdateSupplierDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.Phone)
            .NotEmpty();

        RuleFor(x => x.Address)
            .NotEmpty();
    }
}