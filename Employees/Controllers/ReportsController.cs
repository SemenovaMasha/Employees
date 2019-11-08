using Employees.Models;
using Employees.Models.Dto;
using Employees.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Controllers
{
    public class ReportsController : Controller
    {
        private ReportsService _reportsService;
        private UserManager<EmployeeUser> _userManager;

        private EmployeeUser CurrentUser => _userManager.GetUserAsync(HttpContext.User).Result;

        public ReportsController(ReportsService _reportsService, UserManager<EmployeeUser> _userManager)
        {
            this._reportsService = _reportsService;
            this._userManager = _userManager;
        }

        public DataTable GetReportTable(ReportSettings reportSettings)
        {
            return _reportsService.GetReportTable(reportSettings);
        }

        [Authorize]
        public ActionResult Analitics() => View();

        [Authorize]
        public ActionResult Finance() => View();

        [HttpPost]
        public IActionResult ExportPdf([FromBody]ReportSettings settings)
        {
            return File(_reportsService.ExportPDF(settings), "application/pdf");
        }

        [HttpPost]
        public IActionResult ExportExcel([FromBody]ReportSettings settings)
        {
            return File(_reportsService.ExportExcel(settings), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        }
    }
}
