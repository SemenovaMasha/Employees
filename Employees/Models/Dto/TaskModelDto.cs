using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models.Dto
{
    public class TaskModelDto
    {
        public long Id { get; set; }
        public string TaskNumber { get; set; }
        public string Project { get; set; }
        public long ProjectId { get; set; }
        public string TaskName { get; set; }
        public string TaskDescription { get; set; }
        public string TypeName { get; set; }
        public int Type { get; set; }
        public string PriorityName { get; set; }
        public int Priority { get; set; }
        public string ComplexityName { get; set; }
        public int Complexity { get; set; }
        public string StatusName { get; set; }
        public int Status { get; set; }
        public int EstimatedTime { get; set; }
        public string Parent { get; set; }
        public long? ParentId { get; set; }
        public string TaskUsers { get; set; }
        public int ProgressValue { get; set; }
        public int ProgressMax { get; set; }
        public int DateProgressValue { get; set; }
        public int DateProgressMax { get; set; }
        public DateTime? Date { get; set; }
        public DateTime? CreatedDate { get; set; }
    }
}
