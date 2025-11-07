using FluentValidation;

namespace Kanbanium.Domain.Columns.Commands.ReorderColumns;

public class ReorderColumnsCommandValidator : AbstractValidator<ReorderColumnsCommand>
{
    public ReorderColumnsCommandValidator()
    {
        RuleFor(x => x.BoardId)
            .NotEmpty()
            .WithMessage("Board ID is required");

        RuleFor(x => x.Columns)
            .NotEmpty()
            .WithMessage("Columns list cannot be empty")
            .Must(columns => columns.Count > 0)
            .WithMessage("At least one column is required");

        RuleForEach(x => x.Columns)
            .ChildRules(column =>
            {
                column.RuleFor(c => c.Id)
                    .NotEmpty()
                    .WithMessage("Column ID is required");

                column.RuleFor(c => c.Position)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage("Position must be greater than or equal to 0");
            });

        RuleFor(x => x.Columns)
            .Must(HaveUniqueIds)
            .WithMessage("Column IDs must be unique");

        RuleFor(x => x.Columns)
            .Must(HaveUniquePositions)
            .WithMessage("Column positions must be unique");
    }

    private bool HaveUniqueIds(List<ColumnPositionDto> columns)
    {
        if (columns == null || columns.Count == 0)
            return true;

        return columns.Select(c => c.Id).Distinct().Count() == columns.Count;
    }

    private bool HaveUniquePositions(List<ColumnPositionDto> columns)
    {
        if (columns == null || columns.Count == 0)
            return true;

        return columns.Select(c => c.Position).Distinct().Count() == columns.Count;
    }
}
