using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models.Dto
{
    public class EmailSendDto
    {
        public ReportSettings settings { get; set; }
        public List<string> userIds { get; set; }
    }
}
