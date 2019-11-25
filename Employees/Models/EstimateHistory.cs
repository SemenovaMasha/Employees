using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models
{
    public class EstimateHistory
    {
        [Key]
        public long Id { get; set; }
        public TaskModel TaskModel { get; set; }
        public long TaskModelId { get; set; }
        public EmployeeUser User { get; set; }
        public string UserId { get; set; }
        public decimal OldValue { get; set; }
        public decimal NewValue { get; set; }
        public string Reason { get; set; }
        public DateTime? Date { get; set; }
    }
}
