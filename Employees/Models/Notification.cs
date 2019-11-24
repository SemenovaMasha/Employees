using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models
{
    public class Notification
    {
        [Key] public long Id { get; set; }
        public DateTime Date { get; set; }
        public EmployeeUser User { get; set; }
        public string UserId { get; set; }

        public string Name { get; set; }
        public string Text { get; set; }
        public bool New { get; set; }
    }
}
