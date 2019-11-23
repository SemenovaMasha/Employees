using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models
{
    public class EmployeeUser : IdentityUser
    {
        public string FIO { get; set; }
        public DateTime? BirthDate { get; set; }
        public string PassportSeriesNumber { get; set; }
        public string PassportGiven { get; set; }
        public string Address { get; set; }
        public string Education { get; set; }
        public Position Position { get; set; }
        public long? PositionId { get; set; }
        public string AdditionalInfo { get; set; }
        public decimal Salary { get; set; }
        public List<ProjectUser> ProjectUsers { get; set; }
        public List<TaskUser> TaskUsers { get; set; }

    }

    public static class RolesNames
    {
        public const string Admin = "Администратор";
        public const string Manager = "Менеджер";
        public const string Employee = "Сотрудник";
    }
}
