using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kanbanium.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskIndexesForSearch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_TaskItem_BoardId_IsArchived",
                table: "TaskItem",
                columns: new[] { "BoardId", "IsArchived" });

            migrationBuilder.CreateIndex(
                name: "IX_TaskItem_IsArchived",
                table: "TaskItem",
                column: "IsArchived");

            migrationBuilder.CreateIndex(
                name: "IX_TaskItem_Priority",
                table: "TaskItem",
                column: "Priority");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TaskItem_BoardId_IsArchived",
                table: "TaskItem");

            migrationBuilder.DropIndex(
                name: "IX_TaskItem_IsArchived",
                table: "TaskItem");

            migrationBuilder.DropIndex(
                name: "IX_TaskItem_Priority",
                table: "TaskItem");
        }
    }
}
