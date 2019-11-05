using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models.Dto
{
    public class LaborDto
    {
        public long Id { get; set; }
        public DateTime Date { get; set; }
        public string Project { get; set; }
        public long ProjectId { get; set; }
        public string TaskNumber { get; set; }
        public string TaskName { get; set; }
        public string TypeName { get; set; }
        public int Type { get; set; }
        public string PriorityName { get; set; }
        public int Priority { get; set; }
        public int EstimatedTime { get; set; }
        public int ElapsedTime { get; set; }
        public string Note { get; set; }
        public string User { get; set; }
        public string UserId { get; set; }
    }
}
