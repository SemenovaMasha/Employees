using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models
{
    public class Project
    {
        [Key]
        public long Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public EmployeeUser Manager { get; set; }
        public string ManagerId { get; set; }
        public List<ProjectUser> ProjectUsers { get; set; }
    }

    public class ProjectUser
    {
        [Key]
        public long Id { get; set; }
        public EmployeeUser User { get; set; }
        public string UserId { get; set; }
        public Project Project { get; set; }
        public long ProjectId { get; set; }
    }
}
