using FluentValidation;

namespace Kanbanium.Domain.Comments.Commands.CreateComment;

public class CreateCommentCommandValidator : AbstractValidator<CreateCommentCommand>
{
    public CreateCommentCommandValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Comment content is required")
            .MaximumLength(2000).WithMessage("Comment must not exceed 2000 characters");

        RuleFor(x => x.TaskId)
            .NotEmpty().WithMessage("Task ID is required");
    }
}
