using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models.Dto
{
    public class EstimateHistoryDto
    {
        public long Id { get; set; }
        public string TaskModel { get; set; }
        public long TaskModelId { get; set; }
        public string User { get; set; }
        public string UserId { get; set; }
        public decimal OldValue { get; set; }
        public decimal NewValue { get; set; }
        public string Reason { get; set; }
        public DateTime? Date { get; set; }
    }
}
