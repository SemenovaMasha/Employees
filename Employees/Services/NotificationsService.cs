using Employees.Data;
using Employees.Models;
using Employees.Models.Dto;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Employees.Services
{
    public class NotificationsService
    {
        private ApplicationDbContext _context;
        private UserManager<EmployeeUser> _userManager;
        private EmployeeUsersService _employeeUsersService;

        public NotificationsService(ApplicationDbContext _context, UserManager<EmployeeUser> _userManager, EmployeeUsersService _employeeUsersService)
        {
            this._context = _context;
            this._userManager = _userManager;
            this._employeeUsersService = _employeeUsersService;
        }

        public Notification Map(NotificationDto dto)
        {
            Notification user = _context.Notifications.FirstOrDefault(x => x.Id == dto.Id);
            if (user == null)
            {
                user = new Notification();
            }

            user.Name = dto.Name;
            user.Text = dto.Text;
            user.Date = dto.Date;
            user.UserId = dto.UserId;
            user.New = dto.New;

            return user;
        }

        public NotificationDto Map(Notification model)
        {
            return new NotificationDto()
            {
                Id = model.Id,
                Name = model.Name,
                Text = model.Text,
                Date = model.Date,
                UserId = model.UserId,
                User = model.User?.FIO,
                New = model.New
            };
        }

        internal void ReadAll(string id)
        {
            foreach (var notification in _context.Notifications.Include(x => x.User)
                .Where(x => x.UserId == id && x.New))
            {
                notification.New = false;
            }

            _context.SaveChanges();
        }

        public List<NotificationDto> GetAllByUser(string id)
        {
            return _context.Notifications.Include(x => x.User)
                .Where(x => x.UserId == id)
                .OrderByDescending(x => x.Date)
                .ToList().Select(x => Map(x)).ToList();
        }

        public NotificationDto Add(NotificationDto dto)
        {
            Notification notification = Map(dto);
            notification.New=true;
            _context.Notifications.Add(notification);
            _context.SaveChanges();
            return Map(notification);
        }

        public NotificationDto Delete(long id)
        {
            Notification notification = _context.Notifications.FirstOrDefault(x => x.Id == id);
            _context.Notifications.Remove(notification);
            _context.SaveChanges();
            return Map(notification);
        }
        
        public bool HasNew(string id)
        {
            return _context.Notifications
                .Where(x => x.UserId == id)
                .Any(x=>x.New);
        }
    }
}
