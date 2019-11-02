﻿using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models
{
    public class EmployeeUser : IdentityUser
    {
        public string FIO { get; set; }
        public DateTime BirthDate { get; set; }
        public string PassportSeriesNumber { get; set; }
        public string PassportGiven { get; set; }
        public string Address { get; set; }
        public string Education { get; set; }
        public Position Position { get; set; }
        public long? PositionId { get; set; }
        public string AdditionalInfo { get; set; }
    }

    public static class RolesNames
    {
        public static string Admin = "Admin";
        public static string Manager = "Manager";
    }
}
