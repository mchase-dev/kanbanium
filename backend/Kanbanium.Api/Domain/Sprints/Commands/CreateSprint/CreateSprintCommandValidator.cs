using FluentValidation;

namespace Kanbanium.Domain.Sprints.Commands.CreateSprint;

public class CreateSprintCommandValidator : AbstractValidator<CreateSprintCommand>
{
    public CreateSprintCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Sprint name is required")
            .MaximumLength(100).WithMessage("Sprint name must not exceed 100 characters");

        RuleFor(x => x.Goal)
            .MaximumLength(500).WithMessage("Sprint goal must not exceed 500 characters");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("End date is required")
            .GreaterThan(x => x.StartDate).WithMessage("End date must be after start date");

        RuleFor(x => x.BoardId)
            .NotEmpty().WithMessage("Board ID is required");
    }
}
