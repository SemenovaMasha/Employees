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
    public class TaskModelsController: Controller
    {
        private TaskModelsService _TaskModelService;
        private UserManager<EmployeeUser> _userManager;

        private EmployeeUser CurrentUser => _userManager.GetUserAsync(HttpContext.User).Result;

        public TaskModelsController(TaskModelsService _TaskModelService, UserManager<EmployeeUser> _userManager)
        {
            this._TaskModelService = _TaskModelService;
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

        public List<TaskModelDto> GetAll()
        {
            return _TaskModelService.GetAll();
        }


        public TaskModelDto Get(long id)
        {
            return _TaskModelService.Get(id);
        }

        public List<TaskModelDto> GetAllMine()
        {
            return _TaskModelService.GetAllByUser(CurrentUser.Id);
        }

        [HttpPost]
        public TaskModelDto Add([FromBody]TaskModelDto dto)
        {
            return _TaskModelService.Add(dto, CurrentUser);
        }

        public TaskModelDto Delete(long id)
        {
            return _TaskModelService.Delete(id);
        }

        [HttpPost]
        public TaskModelDto Update([FromBody]TaskModelDto dto)
        {
            return _TaskModelService.Update(dto);
        }

        public bool ListReadonly()
        {
            return !_userManager.IsInRoleAsync(CurrentUser, RolesNames.Admin).Result;
        }

        //public bool CanEditTaskModel(long id)
        //{
        //    return _TaskModelService.CanEditTaskModel(id,_userManager.GetRolesAsync(CurrentUser).Result.ToList(), CurrentUser.Id);
        //}

        public List<EmployeeUserDto> GetTaskModelUsers(long id)
        {
            return _TaskModelService.GetTaskModelUsers(id);
        }
        //public List<TaskModelDto> GetTaskModelByManager(string id)
        //{
        //    return _TaskModelService.GetTaskModelByManager(id);
        //}

        public List<EmployeeUserDto> GetUsersToChoose(long id)
        {
            return _TaskModelService.GetUsersToChoose(id);
        }

        public void RemoveFromTaskModel(string employeeId, long TaskModelId)
        {
            _TaskModelService.RemoveFromTaskModel(employeeId,TaskModelId);
        }
        
        [HttpPost]
        public void AddUsersToTaskModel(long TaskModelId, [FromBody]List<string> userIds)
        {
            _TaskModelService.AddUsersToTaskModel(TaskModelId, userIds);
        }

        public List<EnumDto> GetAllComplexitys()
        {
            return _TaskModelService.GetAllComplexitys();
        }

        public List<TaskModelDto> GetTaskModelSub(long id)
        {
            return _TaskModelService.GetTaskModelSub(id);
        }

        public List<TaskModelDto> GetParents(long id)
        {
            return _TaskModelService.GetParents(id);
        }

        [HttpPost]
        public EstimateDto GetEstimate([FromBody]EstimateDataDto dto)
        {
            return _TaskModelService.GetEstimate(dto);
        }

        public EstimateDto TimeMatch(long id)
        {
            return _TaskModelService.TimeMatch(id);
        }
    }
}
