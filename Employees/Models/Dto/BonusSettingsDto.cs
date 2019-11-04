using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models.Dto
{
    public class BonusSettingsDto
    {
        public long Id { get; set; }
        public string Project { get; set; }
        public long ProjectId { get; set; }
        public decimal DeltaPercent { get; set; }
        public decimal BonusPercent { get; set; }
        public decimal Coef { get; set; }

    }
}
