using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kanbanium.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_TaskHistories_TaskId_CreatedAt",
                table: "TaskHistories",
                columns: new[] { "TaskId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Comments_CreatedAt",
                table: "Comments",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_TaskId_CreatedAt",
                table: "Comments",
                columns: new[] { "TaskId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Boards_CreatedBy",
                table: "Boards",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Boards_IsArchived",
                table: "Boards",
                column: "IsArchived");

            migrationBuilder.CreateIndex(
                name: "IX_Boards_IsArchived_CreatedAt",
                table: "Boards",
                columns: new[] { "IsArchived", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_CreatedAt",
                table: "Attachments",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_CreatedBy",
                table: "Attachments",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_TaskId_CreatedAt",
                table: "Attachments",
                columns: new[] { "TaskId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TaskHistories_TaskId_CreatedAt",
                table: "TaskHistories");

            migrationBuilder.DropIndex(
                name: "IX_Comments_CreatedAt",
                table: "Comments");

            migrationBuilder.DropIndex(
                name: "IX_Comments_TaskId_CreatedAt",
                table: "Comments");

            migrationBuilder.DropIndex(
                name: "IX_Boards_CreatedBy",
                table: "Boards");

            migrationBuilder.DropIndex(
                name: "IX_Boards_IsArchived",
                table: "Boards");

            migrationBuilder.DropIndex(
                name: "IX_Boards_IsArchived_CreatedAt",
                table: "Boards");

            migrationBuilder.DropIndex(
                name: "IX_Attachments_CreatedAt",
                table: "Attachments");

            migrationBuilder.DropIndex(
                name: "IX_Attachments_CreatedBy",
                table: "Attachments");

            migrationBuilder.DropIndex(
                name: "IX_Attachments_TaskId_CreatedAt",
                table: "Attachments");
        }
    }
}
