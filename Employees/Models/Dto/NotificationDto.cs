using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models.Dto
{
    public class NotificationDto
    {
        public long Id { get; set; }
        public DateTime Date { get; set; }
        public string User { get; set; }
        public string UserId { get; set; }

        public string Name { get; set; }
        public string Text { get; set; }
        public bool New { get; set; }
    }
}
