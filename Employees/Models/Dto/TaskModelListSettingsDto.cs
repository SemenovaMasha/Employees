using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models.Dto
{
    public class TaskModelListSettingsDto
    {
        public ByUser ByUser { get; set; }
        public ByStatus ByStatus { get; set; }
    }
    public enum ByUser
    {
        Mine = 0,
        All = 1
    }
    public enum ByStatus
    {
        Open=0,
        Done=1,
        All=2,
        Over=3
    }
}
