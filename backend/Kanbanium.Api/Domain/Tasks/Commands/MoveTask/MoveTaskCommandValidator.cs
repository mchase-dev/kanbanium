using FluentValidation;

namespace Kanbanium.Domain.Tasks.Commands.MoveTask;

public class MoveTaskCommandValidator : AbstractValidator<MoveTaskCommand>
{
    public MoveTaskCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Task ID is required");

        RuleFor(x => x.ColumnId)
            .NotEmpty()
            .WithMessage("Column ID is required");

        RuleFor(x => x.PositionIndex)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Position index must be greater than or equal to 0");
    }
}
