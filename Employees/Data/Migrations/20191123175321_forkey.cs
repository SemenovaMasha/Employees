using Microsoft.EntityFrameworkCore.Migrations;

namespace Employees.Data.Migrations
{
    public partial class forkey : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "TaskModelId",
                table: "Labors",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Labors_TaskModelId",
                table: "Labors",
                column: "TaskModelId");

            migrationBuilder.AddForeignKey(
                name: "FK_Labors_TaskModels_TaskModelId",
                table: "Labors",
                column: "TaskModelId",
                principalTable: "TaskModels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Labors_TaskModels_TaskModelId",
                table: "Labors");

            migrationBuilder.DropIndex(
                name: "IX_Labors_TaskModelId",
                table: "Labors");

            migrationBuilder.DropColumn(
                name: "TaskModelId",
                table: "Labors");
        }
    }
}
