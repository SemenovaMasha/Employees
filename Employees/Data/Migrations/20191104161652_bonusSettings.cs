using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Employees.Data.Migrations
{
    public partial class bonusSettings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BonusSettings",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ProjectId = table.Column<long>(nullable: false),
                    DeltaPercent = table.Column<decimal>(nullable: false),
                    BonusPercent = table.Column<decimal>(nullable: false),
                    Coef = table.Column<decimal>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BonusSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BonusSettings_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BonusSettings_ProjectId",
                table: "BonusSettings",
                column: "ProjectId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BonusSettings");
        }
    }
}
