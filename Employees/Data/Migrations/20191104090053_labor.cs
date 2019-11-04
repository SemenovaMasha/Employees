using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Employees.Data.Migrations
{
    public partial class labor : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Labors",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ProjectId = table.Column<long>(nullable: false),
                    TaskNumber = table.Column<string>(nullable: true),
                    TaskName = table.Column<string>(nullable: true),
                    Type = table.Column<int>(nullable: false),
                    Priority = table.Column<int>(nullable: false),
                    EstimatedTime = table.Column<int>(nullable: false),
                    ElapsedTime = table.Column<int>(nullable: false),
                    Note = table.Column<string>(nullable: true),
                    UserId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Labors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Labors_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Labors_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Labors_ProjectId",
                table: "Labors",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Labors_UserId",
                table: "Labors",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Labors");
        }
    }
}
