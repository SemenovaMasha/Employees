using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Employees.Services;
using Employees.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Employees.Models.Dto;

namespace Employees.Controllers
{
    public class NotificationsController : Controller
    {
        private NotificationsService _notificationService;
        private UserManager<EmployeeUser> _userManager;

        private EmployeeUser CurrentUser => _userManager.GetUserAsync(HttpContext.User).Result;

        public NotificationsController(NotificationsService _notificationService, UserManager<EmployeeUser> _userManager)
        {
            this._notificationService = _notificationService;
            this._userManager = _userManager;
        }

        [Authorize]
        public ActionResult Index()
        {
            return View();
        }

        public List<NotificationDto> GetAllMine()
        {
            return _notificationService.GetAllByUser(CurrentUser.Id);
        }

        [HttpPost]
        public NotificationDto Add([FromBody]NotificationDto dto)
        {
            return _notificationService.Add(dto);
        }

        public NotificationDto Delete(long id)
        {
            return _notificationService.Delete(id);
        }

        public void ReadAll()
        {
            _notificationService.ReadAll(CurrentUser.Id);
        }
    }
}
