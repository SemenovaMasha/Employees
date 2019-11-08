using ClosedXML.Excel;
using Employees.Data;
using Employees.Models;
using Employees.Models.Dto;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Services
{
    public class ReportsService
    {
        private ApplicationDbContext _context;
        private UserManager<EmployeeUser> _userManager;
        private readonly IConfiguration configuration;

        public ReportsService(ApplicationDbContext _context, UserManager<EmployeeUser> _userManager, IConfiguration config)
        {
            this._context = _context;
            this._userManager = _userManager;
            configuration = config; ;
        }

        public DataTable GetReportTable(ReportSettings reportSettings)
        {
            string sql;
            switch (reportSettings.ReportType)
            {
                case ReportType.Labors:
                    sql = GetLaborsReportSqlCommand(reportSettings);
                    return GetDataTableFromSql(sql);
                case ReportType.MatchEstimate:
                    sql = GetMatchEstimateReportSqlCommand(reportSettings);
                    return GetDataTableFromSql(sql);
                case ReportType.NotMatchEstimate:
                    sql = GetNotMatchEstimateReportSqlCommand(reportSettings);
                    return GetDataTableFromSql(sql);
                case ReportType.OverTime:
                    sql = GetOverTimeReportSqlCommand(reportSettings);
                    return GetDataTableFromSql(sql);
                case ReportType.TaskTypes:
                    sql = GetTaskTypesReportSqlCommand(reportSettings);
                    return GetDataTableFromSql(sql);
                case ReportType.TaskTimes:
                    sql = GetTaskTimesReportSqlCommand(reportSettings);
                    return GetDataTableFromSql(sql);
                case ReportType.Bonus:
                    return GetBonusReportSqlCommand(reportSettings);
                default:
                    return GetDataTableFromSql("select * from labors");
            }
        }
        
        private DataTable GetDataTableFromSql(string sql)
        {
            var table = new DataTable();
            using (var da = new SqlDataAdapter(sql, configuration.GetConnectionString("DefaultConnection")))
            {
                da.Fill(table);
            }
            return table;
        }

        private string GetLaborsReportSqlCommand(ReportSettings reportSettings)
        {
            return $@"
select FORMAT (Date, 'dd.MM.yyyy') as 'Дата',e.FIO as 'Сотрудник' , p.Name as 'Проект', l.TaskNumber as 'Номер задачи', 
    l.TaskName as 'Описание задачи', l.EstimatedTime as 'Оценочное время', l.ElapsedTime as 'Затраченное время'
from labors as l
join AspNetUsers as e on e.Id = l.UserId
join Projects as p on p.Id = l.ProjectId

where 1 = 1 
    {(string.IsNullOrEmpty(reportSettings.UserId) ? "" : $"and l.UserId = '{reportSettings.UserId}'")}
    {(reportSettings.ProjectId == -1 ? "" : $"and l.ProjectId = '{reportSettings.ProjectId}'")}
    {(reportSettings.StartDate.HasValue ? $"and l.Date >= '{reportSettings.StartDate.Value.ToString("yyyy-MM-dd")}'" : "")}
    {(reportSettings.EndDate.HasValue ? $"and l.Date <= '{reportSettings.EndDate.Value.ToString("yyyy-MM-dd")}'" : "")}

order by l.Date desc
";
        }

        private string GetMatchEstimateReportSqlCommand(ReportSettings reportSettings)
        {
            return $@"
select fio as'Сотрудник' , sumEstimated as'Сумма оценочного времени' , sumElapsed as'Сумма затраченного времени' 
	,cast(round(((1-   sumElapsed* 1.0  /  NULLIF(sumEstimated,0)  )*100),2)  as numeric(36,2)) as 'Процент сокращения времени'
from (
        select e.FIO as 'fio' , COALESCE(sum(l.EstimatedTime),0)  as 'sumEstimated',
		COALESCE(sum(l.ElapsedTime),0) as 'sumElapsed'
		from labors as l
		join AspNetUsers as e on e.Id = l.UserId


		where 1 = 1 
            {(reportSettings.ProjectId == -1 ? "" : $"and l.ProjectId = '{reportSettings.ProjectId}'")}
            {(reportSettings.StartDate.HasValue ? $"and l.Date >= '{reportSettings.StartDate.Value.ToString("yyyy-MM-dd")}'" : "")}
            {(reportSettings.EndDate.HasValue ? $"and l.Date <= '{reportSettings.EndDate.Value.ToString("yyyy-MM-dd")}'" : "")}

		group by e.fio
      ) as timeSum
where timeSum.sumEstimated >= timeSum.sumElapsed

order by fio
";
        }

        private string GetNotMatchEstimateReportSqlCommand(ReportSettings reportSettings)
        {
            return $@"
select fio as'Сотрудник' , sumEstimated as'Сумма оценочного времени' , sumElapsed as'Сумма затраченного времени' 
	,cast(round(((sumElapsed * 1.0  /  NULLIF(sumEstimated,0) -1    )*100),2)  as numeric(36,2)) as 'Процент лишнего времени'
from (
        select e.FIO as 'fio' , COALESCE(sum(l.EstimatedTime),0)  as 'sumEstimated',
		COALESCE(sum(l.ElapsedTime),0) as 'sumElapsed'
		from labors as l
		join AspNetUsers as e on e.Id = l.UserId


		where 1 = 1 
            {(reportSettings.ProjectId == -1 ? "" : $"and l.ProjectId = '{reportSettings.ProjectId}'")}
            {(reportSettings.StartDate.HasValue ? $"and l.Date >= '{reportSettings.StartDate.Value.ToString("yyyy-MM-dd")}'" : "")}
            {(reportSettings.EndDate.HasValue ? $"and l.Date <= '{reportSettings.EndDate.Value.ToString("yyyy-MM-dd")}'" : "")}

		group by e.fio
      ) as timeSum
where timeSum.sumEstimated < timeSum.sumElapsed

order by fio
";
        }

        private string GetOverTimeReportSqlCommand(ReportSettings reportSettings)
        {
            int workingDaysCount = GetWorkingDays(reportSettings.StartDate ?? DateTime.MinValue, reportSettings.EndDate ?? DateTime.MaxValue);
            return $@"
select fio as'Сотрудник', workDays as 'Количество рабочих дней',workMinutes as 'Количество рабочих минут',
	sumElapsed as'Количество отработанных минут' 
	,cast(round(((sumElapsed * 1.0  /  NULLIF(workMinutes,0) -1    )*100),2)  as numeric(36,2)) as 'Процент переработки'

from (
        select {workingDaysCount} as workDays, {workingDaysCount}*480 as workMinutes , e.FIO as 'fio' , COALESCE(sum(l.ElapsedTime),0) as 'sumElapsed'
		from labors as l
		join AspNetUsers as e on e.Id = l.UserId

		where 1 = 1 
            {(reportSettings.StartDate.HasValue ? $"and l.Date >= '{reportSettings.StartDate.Value.ToString("yyyy-MM-dd")}'" : "")}
            {(reportSettings.EndDate.HasValue ? $"and l.Date <= '{reportSettings.EndDate.Value.ToString("yyyy-MM-dd")}'" : "")}
            group by e.fio
      ) as timeSum
where timeSum.sumElapsed > timeSum.workMinutes
order by fio
";
        }

        private string GetTaskTypesReportSqlCommand(ReportSettings reportSettings)
        {
            var taskTypes = Enum.GetValues(typeof(TaskType)).Cast<TaskType>();

            var columnNames = new List<string>();
            var pivotCol = new List<string>();
            foreach (var type in taskTypes)
            {
                columnNames.Add($"[{(int)type}] as '{type.GetDescription()}'");
                pivotCol.Add($"[{(int)type}]");
            }
            var columns = String.Join(", ", columnNames.ToArray());
            var pivotIn = String.Join(", ", pivotCol.ToArray());

            return $@"
select fio as 'Сотрудник',{columns}
from
(
	select fio, ElapsedTime,""Type"" from Labors l 
    join AspNetUsers as e on e.Id = l.UserId
        where 1 = 1        
        {(string.IsNullOrEmpty(reportSettings.UserId) ? "" : $"and l.UserId = '{reportSettings.UserId}'")}
        {(reportSettings.ProjectId == -1 ? "" : $"and l.ProjectId = '{reportSettings.ProjectId}'")}
        {(reportSettings.StartDate.HasValue ? $"and l.Date >= '{reportSettings.StartDate.Value.ToString("yyyy-MM-dd")}'" : "")}
        {(reportSettings.EndDate.HasValue ? $"and l.Date <= '{reportSettings.EndDate.Value.ToString("yyyy-MM-dd")}'" : "")}
) as d
pivot
(
  sum(ElapsedTime)
  for ""Type"" in ({pivotIn})
) as piv
";
        }

        private string GetTaskTimesReportSqlCommand(ReportSettings reportSettings)
        {
            return $@"
select task as'Номер задачи', project as 'Проект',sumEstimated as 'Сумма оценочного времени',
	sumElapsed as'Сумма затраченного времени',sumElapsed -sumEstimated  as 'Разница'
from (
        select p.name as project, l.TaskNumber as task ,  COALESCE(sum(l.EstimatedTime),0)  as 'sumEstimated', COALESCE(sum(l.ElapsedTime),0) as 'sumElapsed'
		from labors as l
		join Projects as p on p.Id = l.ProjectId

        where 1 = 1        
        {(string.IsNullOrEmpty(reportSettings.UserId) ? "" : $"and l.UserId = '{reportSettings.UserId}'")}
        {(reportSettings.ProjectId == -1 ? "" : $"and l.ProjectId = '{reportSettings.ProjectId}'")}
        {(reportSettings.StartDate.HasValue ? $"and l.Date >= '{reportSettings.StartDate.Value.ToString("yyyy-MM-dd")}'" : "")}
        {(reportSettings.EndDate.HasValue ? $"and l.Date <= '{reportSettings.EndDate.Value.ToString("yyyy-MM-dd")}'" : "")}

            group by l.TaskNumber, p.name
      ) as timeSum
order by task
";
        }

        private DataTable GetBonusReportSqlCommand(ReportSettings reportSettings)
        {
            string sql = $@"
select *, part * 100 as projectPartPercent, cast(round(part* 1.0 * sum1,2)as numeric(36,2)) as projectSum1,
	cast(round(((1-  sumEstimated *1.0 /  NULLIF(sumElapsed, 0)  )*100),2)as numeric(36,2)) as timeDelta,
	0.0 as bonusCoef, 0.0 as bonusSum

	from(
	select *,cast(round((sumElapsed*1.0/NULLIF(userTime, 0)),2)as numeric(36,2)) as part , Salary * userTime/10000   as sum1 from(
		select distinct e.FIO as fio ,p.name as project , l.ProjectId as ProjectId
			,COALESCE(sum(l.EstimatedTime) over(partition by l.userId,l.projectId) ,0)  as sumEstimated
			,COALESCE(sum(l.ElapsedTime)over(partition by l.userId,l.projectId) ,0) as sumElapsed
			,COALESCE(sum(l.ElapsedTime) over(partition by l.userId),0) as userTime
			, e.Salary 
			,e.Id 
			from labors as l
			join AspNetUsers as e on e.Id = l.UserId
			join Projects as p on p.Id = l.ProjectId
		
        where 1 = 1        
        {(string.IsNullOrEmpty(reportSettings.UserId) ? "" : $"and l.UserId = '{reportSettings.UserId}'")}
        {(reportSettings.StartDate.HasValue ? $"and l.Date >= '{reportSettings.StartDate.Value.ToString("yyyy-MM-dd")}'" : "")}
        {(reportSettings.EndDate.HasValue ? $"and l.Date <= '{reportSettings.EndDate.Value.ToString("yyyy-MM-dd")}'" : "")}

	) as t
) as t2

        {(reportSettings.ProjectId == -1 ? "" : $"where ProjectId = '{reportSettings.ProjectId}'")}
order by fio
";
            var table = GetDataTableFromSql(sql);

            foreach(DataRow row in table.Rows)
            {
                var timeDelta = Convert.ToDecimal(row["timeDelta"]);
                decimal coef;
                decimal bonusPercent;
                GetBonusCoef(Convert.ToInt64(row["ProjectId"]), timeDelta, out coef, out bonusPercent);
                var bonusCoef = timeDelta > 0 ? (-bonusPercent) : (bonusPercent);
                row["bonusCoef"] = decimal.Round(1+bonusCoef, 2);
                row["bonusSum"] = decimal.Round(Convert.ToDecimal(row["projectSum1"]) * (bonusCoef) * (timeDelta < 0 ? coef : 1), 2);
            }
            table.Columns.Remove("ProjectId");
            table.Columns.Remove("sumEstimated");
            table.Columns.Remove("Salary");
            table.Columns.Remove("Id");
            table.Columns.Remove("part");
            table.Columns.Remove("sum1");
            table.Columns["fio"].ColumnName = "Сотрудник";
            table.Columns["project"].ColumnName = "Проект";
            table.Columns["sumElapsed"].ColumnName = "Минут на проекте";
            table.Columns["userTime"].ColumnName = "Всего минут";
            table.Columns["projectPartPercent"].ColumnName = "Процент времени на проекте";
            table.Columns["projectSum1"].ColumnName = "Часть оклада за проект";
            table.Columns["timeDelta"].ColumnName = "Процент отклонения времени";
            table.Columns["bonusCoef"].ColumnName = "Коэффициент (де)премирования";
            table.Columns["bonusSum"].ColumnName = "Сумма (де)премирования";

            return table;
        }

        public int GetWorkingDays(DateTime from, DateTime to)
        {
            var dayDifference = (int)to.Subtract(from).TotalDays;
            return Enumerable
                .Range(1, dayDifference)
                .Select(x => from.AddDays(x))
                .Count(x => x.DayOfWeek != DayOfWeek.Saturday && x.DayOfWeek != DayOfWeek.Sunday);
        }

        private void GetBonusCoef(long projectId, decimal deltaPercent, out decimal coef, out decimal bonusPercent)
        {
            string sql = $@"
select top(1) (b.BonusPercent*1.0/100) as bonusPercent, b.Coef as coef from (
	select max(b.DeltaPercent) as maxDeltaPercent
	from BonusSettings b
	where 
		b.ProjectId = {projectId} and 
		b.DeltaPercent <= abs({deltaPercent.ToString().Replace(",",".")}) 
) as x inner join BonusSettings as b on b.DeltaPercent = x.maxDeltaPercent
";
            DataTable table = GetDataTableFromSql(sql);
            if (table.Rows.Count > 0)
            {
                bonusPercent = Convert.ToDecimal(table.Rows[0]["bonusPercent"].ToString());
                coef = Convert.ToDecimal(table.Rows[0]["coef"].ToString());
            }
            else
            {
                bonusPercent = 0;
                coef = 1;
            }
        }

        private byte[] exportpdf(DataTable dtEmployee,string reportName)
        {
            // creating document object  
            System.IO.MemoryStream ms = new System.IO.MemoryStream();
            iTextSharp.text.Rectangle rec = new iTextSharp.text.Rectangle(PageSize.A4);
            rec.BackgroundColor = new BaseColor(System.Drawing.Color.Olive);
            Document doc = new Document(rec);
            doc.SetPageSize(iTextSharp.text.PageSize.A4.Rotate());
            //doc.SetPageSize(iTextSharp.text.PageSize.A4);
            PdfWriter writer = PdfWriter.GetInstance(doc, ms);
            doc.Open();

            BaseFont baseFont = BaseFont.CreateFont(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "../../../wwwroot/fonts/Arial.ttf"), BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED);
            //Creating paragraph for header  
            BaseFont bfntHead = baseFont;
            iTextSharp.text.Font fntHead = new iTextSharp.text.Font(bfntHead, 16, 1, iTextSharp.text.BaseColor.BLACK);
            Paragraph prgHeading = new Paragraph();
            prgHeading.Alignment = Element.ALIGN_LEFT;
            prgHeading.Add(new Chunk(reportName.ToUpper(), fntHead));
            doc.Add(prgHeading);

            //Adding a line  
            Paragraph p = new Paragraph(new Chunk(new iTextSharp.text.pdf.draw.LineSeparator(0.0F, 100.0F, iTextSharp.text.BaseColor.BLACK, Element.ALIGN_LEFT, 1)));
            doc.Add(p);

            //Adding line break  
            doc.Add(new Chunk("\n", fntHead));

            //Adding  PdfPTable  
            PdfPTable table = new PdfPTable(dtEmployee.Columns.Count);

            for (int i = 0; i < dtEmployee.Columns.Count; i++)
            {
                string cellText = dtEmployee.Columns[i].ColumnName;
                PdfPCell cell = new PdfPCell();
                cell.Phrase = new Phrase(cellText, new iTextSharp.text.Font(baseFont));
                cell.BackgroundColor = new BaseColor(200, 200, 200);
                //cell.Phrase = new Phrase(cellText, new Font(Font.FontFamily.TIMES_ROMAN, 10, 1, new BaseColor(grdStudent.HeaderStyle.ForeColor)));  
                //cell.BackgroundColor = new BaseColor(grdStudent.HeaderStyle.BackColor);  
                cell.HorizontalAlignment = Element.ALIGN_CENTER;
                cell.PaddingBottom = 5;
                table.AddCell(cell);
            }

            //writing table Data  
            for (int i = 0; i < dtEmployee.Rows.Count; i++)
            {
                for (int j = 0; j < dtEmployee.Columns.Count; j++)
                {
                    table.AddCell( new Phrase(dtEmployee.Rows[i][j].ToString(), new iTextSharp.text.Font(baseFont)));
                }
            }

            //Paragraph p2 = new Paragraph();
            ////p2.IndentationLeft = 100;
            ////table.HorizontalAlignment = Element.ALIGN_LEFT;
            //p2.Add(table);
            //doc.Add(p);

            table.WidthPercentage = 100;
            doc.Add(table);
            doc.Close();

            byte[] result = ms.ToArray();
            return result;

        }

        public byte[] ExportPDF(ReportSettings settings)
        {
            return exportpdf(GetReportTable(settings), settings.ReportType.GetDescription());
        }

        public byte[] ExportExcel(ReportSettings settings)
        {
            return exportExcel(GetReportTable(settings), settings.ReportType.GetDescription());
        }

        private byte[] exportExcel(DataTable dt, string sheet)
        {
            using (var workbook = new XLWorkbook())
            {
                workbook.Worksheets.Add(dt, "Отчет");

                //workbook.SaveAs("HelloWorld.xlsx");

                var workbookBytes = new byte[0];
                using (var ms = new MemoryStream())
                {
                    workbook.SaveAs(ms);
                    workbookBytes = ms.ToArray();
                }

                return workbookBytes;
            }
        }

    }

}
