using FluentValidation;

namespace Kanbanium.Domain.Columns.Commands.CreateColumn;

public class CreateColumnCommandValidator : AbstractValidator<CreateColumnCommand>
{
    public CreateColumnCommandValidator()
    {
        RuleFor(x => x.BoardId)
            .NotEmpty()
            .WithMessage("Board ID is required");

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
