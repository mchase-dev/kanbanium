using FluentValidation;

namespace Kanbanium.Domain.SubTasks.Commands.CreateSubTask;

public class CreateSubTaskCommandValidator : AbstractValidator<CreateSubTaskCommand>
{
    public CreateSubTaskCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("SubTask title is required")
            .MaximumLength(200).WithMessage("SubTask title must not exceed 200 characters");

        RuleFor(x => x.TaskId)
            .NotEmpty().WithMessage("Task ID is required");
    }
}
