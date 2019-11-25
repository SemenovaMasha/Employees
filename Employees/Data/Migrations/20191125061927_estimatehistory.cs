using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Employees.Data.Migrations
{
    public partial class estimatehistory : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EstimateHistories",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    TaskModelId = table.Column<long>(nullable: false),
                    UserId = table.Column<string>(nullable: true),
                    OldValue = table.Column<decimal>(nullable: false),
                    NewValue = table.Column<decimal>(nullable: false),
                    Reason = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstimateHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EstimateHistories_TaskModels_TaskModelId",
                        column: x => x.TaskModelId,
                        principalTable: "TaskModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EstimateHistories_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EstimateHistories_TaskModelId",
                table: "EstimateHistories",
                column: "TaskModelId");

            migrationBuilder.CreateIndex(
                name: "IX_EstimateHistories_UserId",
                table: "EstimateHistories",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EstimateHistories");
        }
    }
}
