using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models.Dto
{
    public class EstimateDto
    {
        public int Minutes { get; set; }
        public DateTime Date { get; set; }
        public bool Match { get; set; }
    }

    public class EstimateDataDto
    {
        public long Id { get; set; }
        public int Type { get; set; }
        public int Priority { get; set; }
        public int Complexity { get; set; }
    }
}
