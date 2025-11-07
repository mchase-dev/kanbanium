using FluentValidation;

namespace Kanbanium.Domain.BoardMembers.Commands.AddBoardMember;

public class AddBoardMemberCommandValidator : AbstractValidator<AddBoardMemberCommand>
{
    public AddBoardMemberCommandValidator()
    {
        RuleFor(x => x.BoardId)
            .NotEmpty()
            .WithMessage("Board ID is required");

        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required");

        RuleFor(x => x.Role)
            .IsInEnum()
            .WithMessage("Invalid board role");
    }
}
