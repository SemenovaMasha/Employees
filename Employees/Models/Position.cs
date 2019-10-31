using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models
{
    public class Position
    {
        [Key]
        public long Id { get; set; }
        [Required]
        public string Name { get; set; }
        public decimal? MinSalary { get; set; }
    }
}
