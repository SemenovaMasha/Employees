using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Models.Dto
{
    public class ReportSettings
    {
        public ReportType ReportType { get; set; }
        public string UserId { get; set; }
        public string User { get; set; }
        public long ProjectId { get; set; }
        public string Project { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? MonthDate { get; set; }
    }

    public enum ReportType
    {
        [Description("Отчет «Трудозатраты» сотрудников")]
        Labors = 0,
        [Description("Отчет по сотрудникам, укладывающимся в оценочное время")]
        MatchEstimate = 1,
        [Description("Отчет по сотрудникам, не укладывающимся в оценочное время")]
        NotMatchEstimate = 2,
        [Description("Отчет по сотрудникам, отработавшим сверх нормы")]
        OverTime = 3,
        [Description("Распределение времени сотрудника по типам задач")]
        TaskTypes = 4,
        [Description("Отчет об оценочном и фактическом затраченном времени на задачу")]
        TaskTimes = 5,

        [Description("Итоговый отчет по заработной плате сотрудника за определенный месяц")]
        Salary = 6,
        [Description("Отчет о сумме премирования")]
        Bonus = 7
    }
}
