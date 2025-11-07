using FluentValidation;

namespace Kanbanium.Domain.Labels.Commands.AddTaskLabel;

public class AddTaskLabelCommandValidator : AbstractValidator<AddTaskLabelCommand>
{
    public AddTaskLabelCommandValidator()
    {
        RuleFor(x => x.TaskId)
            .NotEmpty().WithMessage("Task ID is required");

        RuleFor(x => x.LabelId)
            .NotEmpty().WithMessage("Label ID is required");
    }
}
