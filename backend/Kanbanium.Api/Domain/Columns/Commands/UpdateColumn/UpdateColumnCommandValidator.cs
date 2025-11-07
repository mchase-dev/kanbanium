using FluentValidation;

namespace Kanbanium.Domain.Columns.Commands.UpdateColumn;

public class UpdateColumnCommandValidator : AbstractValidator<UpdateColumnCommand>
{
    public UpdateColumnCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Column ID is required");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Column name is required")
            .MaximumLength(50)
            .WithMessage("Column name must not exceed 50 characters");

        RuleFor(x => x.WipLimit)
            .GreaterThan(0)
            .When(x => x.WipLimit.HasValue)
            .WithMessage("WIP limit must be greater than 0");
    }
}
