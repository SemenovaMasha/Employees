using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Employees.Services;
using Microsoft.AspNetCore.Identity;
using Employees.Models;
using Employees.Models.Dto;
using Microsoft.AspNetCore.Authorization;

namespace Employees.Controllers
{
    public class ProjectsController: Controller
    {
        private ProjectService _projectService;
        private UserManager<EmployeeUser> _userManager;

        private EmployeeUser CurrentUser
        {
            get
            {
                return _userManager.GetUserAsync(HttpContext.User).Result;
            }
        }

        public ProjectsController(ProjectService _projectService, UserManager<EmployeeUser> _userManager)
        {
            this._projectService = _projectService;
            this._userManager = _userManager;
        }

        [Authorize]
        public ActionResult Index()
        {
            return View();
        }

        [Authorize]
        public ActionResult Details(long id)
        {
            return View("Details", id);
        }

        [Authorize]
        public ActionResult Edit(long id)
        {
            return View("Edit", id);
        }

        public List<ProjectDto> GetAll()
        {
            return _projectService.GetAll();
        }

        public ProjectDto Get(long id)
        {
            return _projectService.Get(id);
        }

        [HttpPost]
        public ProjectDto Add([FromBody]ProjectDto dto)
        {
            return _projectService.Add(dto);
        }

        public ProjectDto Delete(long id)
        {
            return _projectService.Delete(id);
        }

        [HttpPost]
        public ProjectDto Update([FromBody]ProjectDto dto)
        {
            return _projectService.Update(dto);
        }

        public bool ListReadonly()
        {
            return !_userManager.IsInRoleAsync(CurrentUser, RolesNames.Admin).Result;
        }

        public bool CanEditProject(long id)
        {
            return _projectService.CanEditProject(id,_userManager.GetRolesAsync(CurrentUser).Result.ToList(), CurrentUser.Id);
        }

        public List<EmployeeUserDto> GetProjectUsers(long id)
        {
            return _projectService.GetProjectUsers(id);
        }
    }
}
