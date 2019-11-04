using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models
{
    public class BonusSettings
    {
        public long Id { get; set; }
        public Project Project { get; set; }
        public long ProjectId { get; set; }
        public decimal DeltaPercent { get; set; }
        public decimal BonusPercent { get; set; }
        public decimal Coef { get; set; }
    }
}
