using Microsoft.EntityFrameworkCore.Migrations;

namespace Employees.Data.Migrations
{
    public partial class _ : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "BirthDate",
                table: "Labors",
                newName: "Date");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Date",
                table: "Labors",
                newName: "BirthDate");
        }
    }
}
