using Employees.Data;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Employees.Models.Dto;
using Employees.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Employees.Models;

namespace Employees.Controllers
{
    public class EmployeesController:Controller
    {
        private EmployeeUsersService _employeeUsersService;
        private UserManager<EmployeeUser> _userManager;

        public EmployeesController(EmployeeUsersService _employeeUsersService, UserManager<EmployeeUser> _userManager)
        {
            this._employeeUsersService = _employeeUsersService;
            this._userManager = _userManager;
        }

        [Authorize]
        public ActionResult Index()
        {
            return View();
        }

        public List<EmployeeUserDto> GetAll()
        {
            return _employeeUsersService.GetAll();
        }

        [HttpPost]
        public EmployeeUserDto Add([FromBody]EmployeeUserDto dto)
        {
            return _employeeUsersService.Add(dto);
        }

        public EmployeeUserDto Delete(string id)
        {
            return _employeeUsersService.Delete(id);
        }

        [HttpPost]
        public EmployeeUserDto Update([FromBody]EmployeeUserDto dto)
        {
            return _employeeUsersService.Update(dto);
        }

        public bool ListReadonly()
        {
            var user = _userManager.GetUserAsync(HttpContext.User).Result;
            return !_userManager.IsInRoleAsync(user, RolesNames.Admin).Result;
        }
    }
}
