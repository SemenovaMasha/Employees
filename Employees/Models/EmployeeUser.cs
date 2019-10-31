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
    }
}
