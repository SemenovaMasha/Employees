using Employees.Models;
using Employees.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Employees.Models.Dto;

namespace Employees.Controllers
{
    public class LaborsController : Controller
    {
        private LaborsService _laborsService;
        private UserManager<EmployeeUser> _userManager;

        private EmployeeUser CurrentUser
        {
            get { return _userManager.GetUserAsync(HttpContext.User).Result; }
        }

        public LaborsController(LaborsService _laborsService, UserManager<EmployeeUser> _userManager)
        {
            this._laborsService = _laborsService;
            this._userManager = _userManager;
        }

        [Authorize]
        public ActionResult Index()
        {
            return View();
        }

        //[Authorize]
        //public ActionResult Details(long id)
        //{
        //    return View("Details", id);
        //}

        //[Authorize]
        //public ActionResult Edit(long id)
        //{
        //    return View("Edit", id);
        //}

        public List<LaborDto> GetAll()
        {
            return _laborsService.GetAll();
        }

        public List<LaborDto> GetAllMine()
        {
            return _laborsService.GetAllByUser(CurrentUser.Id);
        }

        public List<LaborDto> GetAllMyProjects()
        {
            return _laborsService.GetAllMyProjects(CurrentUser.Id);
        }

        public LaborDto Get(long id)
        {
            return _laborsService.Get(id,CurrentUser.Id,CurrentUser.FIO);
        }

        [HttpPost]
        public LaborDto Add([FromBody] LaborDto dto)
        {
            return _laborsService.Add(dto);
        }

        public LaborDto Delete(long id)
        {
            return _laborsService.Delete(id);
        }

        [HttpPost]
        public LaborDto Update([FromBody] LaborDto dto)
        {
            return _laborsService.Update(dto);
        }

        public bool CanEditLabor(long id)
        {
            return _laborsService.CanEditLabor(id, _userManager.GetRolesAsync(CurrentUser).Result.ToList(), CurrentUser.Id);
        }
        
        public List<EnumDto> GetAllTypes()
        {
            return _laborsService.GetAllTypes();
        }

        public List<EnumDto> GetAllPrioritys()
        {
            return _laborsService.GetAllPrioritys();
        }
    }
}
