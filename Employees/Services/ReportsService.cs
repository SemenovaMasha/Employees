﻿using Employees.Data;
using Employees.Models;
using Employees.Models.Dto;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Services
{
    public class ReportsService
    {
        private ApplicationDbContext _context;
        private UserManager<EmployeeUser> _userManager;

        public ReportsService(ApplicationDbContext _context, UserManager<EmployeeUser> _userManager)
        {
            this._context = _context;
            this._userManager = _userManager;
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
                default:
                    return GetDataTableFromSql("select * from labors");
            }
        }
        //public void GetReportTable()
        //{
        //    using (var connection = _context.Database.GetDbConnection())
        //    {
        //        connection.Open();

        //        using (var cmd = connection.CreateCommand())
        //        {
        //            cmd.CommandText = "SELECT * from labors";
        //            //using (var reader = cmd.ExecuteReader())
        //            //{
        //            //    while (reader.Read())
        //            //    {                            
        //            //    }
        //            //}

        //            using (var reader = cmd.ExecuteReader())
        //            {
        //                var dataTable = new DataTable();
        //                dataTable.Load(reader);
        //            }
        //        }
        //    }
        //}

        private DataTable GetDataTableFromSql(string sql)
        {
            using (var connection = _context.Database.GetDbConnection())
            {
                connection.Open();

                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = sql;
                    using (var reader = cmd.ExecuteReader())
                    {
                        var dataTable = new DataTable();
                        dataTable.Load(reader);
                        return dataTable;
                    }
                }
            }
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

        public int GetWorkingDays(DateTime from, DateTime to)
        {
            var dayDifference = (int)to.Subtract(from).TotalDays;
            return Enumerable
                .Range(1, dayDifference)
                .Select(x => from.AddDays(x))
                .Count(x => x.DayOfWeek != DayOfWeek.Saturday && x.DayOfWeek != DayOfWeek.Sunday);
        }
    }

}
