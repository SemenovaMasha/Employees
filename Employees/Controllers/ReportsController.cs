using Employees.Models;
using Employees.Services;
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

        public DataTable GetReportTable()
        {
            return _reportsService.GetReportTable();
        }

        public ActionResult Analitics() => View();

        public ActionResult Finance() => View();

    }
}
