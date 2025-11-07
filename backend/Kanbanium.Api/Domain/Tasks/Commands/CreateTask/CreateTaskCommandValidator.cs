using FluentValidation;

namespace Kanbanium.Domain.Tasks.Commands.CreateTask;

public class CreateTaskCommandValidator : AbstractValidator<CreateTaskCommand>
{
    public CreateTaskCommandValidator()
    {
        RuleFor(x => x.BoardId)
            .NotEmpty()
            .WithMessage("Board ID is required");

        RuleFor(x => x.ColumnId)
            .NotEmpty()
            .WithMessage("Column ID is required");

        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Task title is required")
            .MaximumLength(200)
            .WithMessage("Task title must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(5000)
            .When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("Description must not exceed 5000 characters");

        RuleFor(x => x.StatusId)
            .NotEmpty()
            .WithMessage("Status is required");

        RuleFor(x => x.TypeId)
            .NotEmpty()
            .WithMessage("Task type is required");

        RuleFor(x => x.Priority)
            .IsInEnum()
            .WithMessage("Invalid priority value");

        RuleFor(x => x.DueDate)
            .GreaterThan(DateTime.UtcNow.Date)
            .When(x => x.DueDate.HasValue)
            .WithMessage("Due date must be in the future");
    }
}
