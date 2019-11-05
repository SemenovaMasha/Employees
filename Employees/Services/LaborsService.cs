using Employees.Data;
using Employees.Models;
using Employees.Models.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Employees.Services
{
    public class LaborsService
    {
        private ApplicationDbContext _context;
        private UserManager<EmployeeUser> _userManager;
        private EmployeeUsersService _employeeUsersService;

        public LaborsService(ApplicationDbContext _context, UserManager<EmployeeUser> _userManager, EmployeeUsersService _employeeUsersService)
        {
            this._context = _context;
            this._userManager = _userManager;
            this._employeeUsersService = _employeeUsersService;
        }

        public Labor Map(LaborDto dto)
        {
            Labor labor =  _context.Labors.FirstOrDefault(x => x.Id == dto.Id);
            if (labor == null)
            {
                labor = new Labor();
            }

            labor.ProjectId = dto.ProjectId;
            labor.TaskNumber = dto.TaskNumber;
            labor.TaskName = dto.TaskName;
            labor.Type = (TaskType)dto.Type;
            labor.Priority = (TaskPriority)dto.Priority;
            labor.EstimatedTime = dto.EstimatedTime;
            labor.ElapsedTime = dto.ElapsedTime;
            labor.Note = dto.Note;
            labor.UserId = dto.UserId;
            labor.Date = dto.Date;

            return labor;
        }

        public LaborDto Map(Labor model)
        {
            return new LaborDto()
            {
                Id = model.Id,
                ProjectId = model.ProjectId,
                TaskNumber = model.TaskNumber,
                TaskName = model.TaskName,
                ElapsedTime = model.ElapsedTime,
                EstimatedTime = model.EstimatedTime,
                Note = model.Note,
                UserId = model.UserId,
                Priority = (int)model.Priority,
                Type = (int)model.Type,
                Project = model.Project?.Name,
                User = model.User?.FIO,
                PriorityName = model.Priority.GetDescription(),
                TypeName = model.Type.GetDescription(),
                Date=model.Date,
            };
        }

        public List<LaborDto> GetAllByUser(string id, DateTime? startDate = null, DateTime? endDate = null)
        {
            return _context.Labors
                .Include(x => x.Project)
                .Include(x => x.User)
                .Where(x => x.UserId == id && ((startDate != null && endDate != null) ? x.Date <= endDate && x.Date >= startDate : true))
                .ToList().Select(x => Map(x)).ToList();
        }

        public List<LaborDto> GetAllMyProjects(string id, DateTime? startDate = null, DateTime? endDate = null)
        {
            return _context.Labors
                .Include(x => x.Project)
                .Include(x => x.User)
                .Where(x => x.Project.ManagerId == id && ((startDate != null && endDate != null) ? x.Date <= endDate && x.Date >= startDate : true))
                .ToList().Select(x => Map(x)).ToList();
        }

        public List<LaborDto> GetAll(DateTime? startDate = null, DateTime? endDate = null)
        {
            return _context.Labors
                .Include(x=>x.Project)
                .Include(x=>x.User)
                .Where(x => (startDate != null && endDate != null) ? x.Date <= endDate && x.Date >= startDate : true)
                .ToList().Select(x => Map(x)).ToList();
        }
        
        public LaborDto Add(LaborDto dto)
        {
            Labor labor = Map(dto);
            _context.Labors.Add(labor);
            _context.SaveChanges();
            return Map(labor);
        }

        public LaborDto Delete(long id)
        {
            Labor labor = _context.Labors.FirstOrDefault(x => x.Id == id);
            _context.Labors.Remove(labor);
            _context.SaveChanges();
            return Map(labor);
        }
        
        public LaborDto Update(LaborDto dto)
        {
            Labor labor = Map(dto);
            _context.Labors.Update(labor);
            _context.SaveChanges();
            return Map(labor);
        }

        public LaborDto Get(long id, string userId="", string userFio="")
        {
            if (id==-1)
            {
                return new LaborDto()
                {
                    Id = -1,
                    UserId = userId,
                    PriorityName = TaskPriority.Usual.GetDescription(),
                    Priority = 0,
                    Type = 0,
                    TypeName = TaskType.Other.GetDescription(),
                    User = userFio,
                    Date = DateTime.Today
                };
            }
            else
            {
                return Map(_context.Labors
                    .Include(x => x.Project)
                    .Include(x => x.User)
                    .FirstOrDefault(x => x.Id == id));
            }
        }

        public bool CanEditLabor(long laborId, List<string> currentUserRoles, string currentUserId)
        {
            var labor = _context.Labors
                .Include(x=>x.Project)
                .FirstOrDefault(x => x.Id == laborId);

            return currentUserRoles.Contains(RolesNames.Admin) ||
                   (currentUserRoles.Contains(RolesNames.Manager) && labor.Project.ManagerId == currentUserId)||
                   labor.UserId == currentUserId;
        }

        public List<EnumDto> GetAllTypes()
        {
            return Enum.GetValues(typeof(TaskType)).Cast<TaskType>().Select(x => new EnumDto()
            {
                Id = (int)x,
                Name = x.GetDescription()
            }).ToList();
        }

        public List<EnumDto> GetAllPrioritys()
        {
            return Enum.GetValues(typeof(TaskPriority)).Cast<TaskPriority>().Select(x => new EnumDto()
            {
                Id = (int)x,
                Name = x.GetDescription()
            }).ToList();
        }
    }

    public class EnumDto
    {
        public int Id { get; set; }

        //description
        public string Name { get; set; }
    }
}
