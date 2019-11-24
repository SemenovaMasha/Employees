using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models
{
    public class TaskModel
    {
        [Key]
        public long Id { get; set; }
        public string TaskNumber { get; set; }
        public Project Project { get; set; }
        public long ProjectId { get; set; }
        public string TaskName { get; set; }
        public string TaskDescription { get; set; }
        public TaskType Type { get; set; }
        public TaskPriority Priority { get; set; }
        public TaskComplexity Complexity { get; set; }
        public TaskStatus Status { get; set; }
        public int EstimatedTime { get; set; }
        public TaskModel Parent { get; set; }
        public long? ParentId { get; set; }
        public DateTime? Date { get; set; }
        public DateTime? CreatedDate { get; set; }

        public List<TaskUser> TaskUsers { get; set; }
    }

    public class TaskUser
    {
        [Key]
        public long Id { get; set; }
        public EmployeeUser User { get; set; }
        public string UserId { get; set; }
        public TaskModel TaskModel { get; set; }
        public long TaskModelId { get; set; }
    }

    public enum TaskStatus
    {
        [Description("Открыта")] Open = 0,

        [Description("Завершена")] Done = 1,
    }
}
