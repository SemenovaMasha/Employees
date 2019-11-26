using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models.Dto
{
    public class LaborsGroupByUser
    {
        public string Id { get; set; }
        public string Fio { get; set; }
        public int ElapsedSum { get; set; }
    }
}
