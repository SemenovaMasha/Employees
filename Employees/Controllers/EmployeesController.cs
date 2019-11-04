using Employees.Data;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
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

        private EmployeeUser CurrentUser
        {
            get
            {
                return _userManager.GetUserAsync(HttpContext.User).Result;
            }
        }

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

        [Authorize]
        public ActionResult Details(string id)
        {
            return View("Details", id);
        }

        [Authorize]
        public ActionResult Edit(string id)
        {
            return View("Edit", id);
        }

        public List<EmployeeUserDto> GetAll()
        {
            return _employeeUsersService.GetAll();
        }

        public List<EmployeeUserDto> GetAllManagers()
        {
            return _employeeUsersService.GetAllManagers();
        }

        public EmployeeUserDto Get(string id)
        {
            return _employeeUsersService.Get(id);
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

        public bool IsAdmin()
        {
            return _userManager.IsInRoleAsync(CurrentUser, RolesNames.Admin).Result;
        }

        public bool IsManager()
        {
            return _userManager.IsInRoleAsync(CurrentUser, RolesNames.Manager).Result|| _userManager.IsInRoleAsync(CurrentUser, RolesNames.Admin).Result;
        }

        public bool CanEditUser(string id)
        {
            return CurrentUser.Id==id || _userManager.IsInRoleAsync(CurrentUser, RolesNames.Admin).Result;
        }
    }
}
