using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Employees.Models.Dto
{
    public class EmployeeUserDto
    {
        public string Id { get; set; }
        public string Mail { get; set; }
        public string FIO { get; set; }
        public DateTime? BirthDate { get; set; }
        public string PassportSeriesNumber { get; set; }
        public string PassportGiven { get; set; }
        public string Address { get; set; }
        public string Education { get; set; }
        public string Position { get; set; }
        public long? PositionId { get; set; }
        public string AdditionalInfo { get; set; }
        public string Role { get; set; }
        public string RoleLocal { get; set; }
        public decimal Salary { get; set; }
        public decimal? Experience { get; set; }
        public string LevelName { get; set; }
        public int Level { get; set; }
        public bool TaskMatch { get; set; }

        public bool IsProjectManager { get; set; }
    }
}
