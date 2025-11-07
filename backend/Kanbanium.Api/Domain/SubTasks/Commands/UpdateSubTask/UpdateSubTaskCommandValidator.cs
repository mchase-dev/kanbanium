using FluentValidation;

namespace Kanbanium.Domain.SubTasks.Commands.UpdateSubTask;

public class UpdateSubTaskCommandValidator : AbstractValidator<UpdateSubTaskCommand>
{
    public UpdateSubTaskCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("SubTask title is required")
            .MaximumLength(200).WithMessage("SubTask title must not exceed 200 characters");
    }
}
