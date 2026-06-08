using ERPSystem.Application.Features.Inventory.DTOs;
using FluentValidation;

namespace ERPSystem.Application.Features.Inventory.Validators;

public class CreateInventoryTransactionDtoValidator
    : AbstractValidator<CreateInventoryTransactionDto>
{
    public CreateInventoryTransactionDtoValidator()
    {
        RuleFor(x => x.StockItemId)
            .GreaterThan(0);

        RuleFor(x => x.TransactionType)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.QuantityChange)
            .NotEqual(0);
    }
}