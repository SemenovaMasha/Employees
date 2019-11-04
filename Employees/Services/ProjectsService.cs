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

namespace Employees.Services
{
    public class ProjectService
    {
        private ApplicationDbContext _context;
        private UserManager<EmployeeUser> _userManager;
        private EmployeeUsersService _employeeUsersService;

        public ProjectService(ApplicationDbContext _context, UserManager<EmployeeUser> _userManager, EmployeeUsersService _employeeUsersService)
        {
            this._context = _context;
            this._userManager = _userManager;
            this._employeeUsersService = _employeeUsersService;
        }

        public Project Map(ProjectDto dto)
        {
            Project user =  _context.Projects.FirstOrDefault(x => x.Id == dto.Id);
            if (user == null)
            {
                user = new Project();
            }

            user.Name = dto.Name;
            user.Description = dto.Description;
            user.ManagerId = dto.ManagerId;

            return user;
        }

        public ProjectDto Map(Project model)
        {
            return new ProjectDto()
            {
                Id = model.Id,
                Name = model.Name,
                Description = model.Description,
                ManagerId = model.ManagerId,
                Manager = model.Manager?.FIO,
            };
        }

        public List<ProjectDto> GetAllByUser(string id)
        {
            return _context.Projects.Include(x => x.Manager).Include(x => x.ProjectUsers)
                .Where(x=>x.ProjectUsers.Any(p=>p.UserId==id))
                .ToList().Select(x => Map(x)).ToList();
        }

        public List<ProjectDto> GetAll()
        {
            return _context.Projects.Include(x=>x.Manager).ToList().Select(x => Map(x)).ToList();
        }
        
        public ProjectDto Add(ProjectDto dto)
        {
            Project project = Map(dto);
            _context.Projects.Add(project);
            _context.ProjectUsers.Add(new ProjectUser()
            {
                ProjectId = project.Id,
                UserId = project.ManagerId
            });
            _context.SaveChanges();
            return Map(project);
        }

        public ProjectDto Delete(long id)
        {
            Project project = _context.Projects.FirstOrDefault(x => x.Id == id);
            _context.Projects.Remove(project);
            _context.SaveChanges();
            return Map(project);
        }
        
        public ProjectDto Update(ProjectDto dto)
        {
            Project project = Map(dto);
            _context.Projects.Update(project);

            if (!_context.ProjectUsers.Any(x => x.ProjectId == project.Id && x.UserId == project.ManagerId))
            {
                _context.ProjectUsers.Add(new ProjectUser()
                {
                    ProjectId = project.Id,
                    UserId = project.ManagerId
                });
            }

            _context.SaveChanges();
            return Map(project);
        }

        public ProjectDto Get(long id)
        {
            if (id==-1)
            {
                return new ProjectDto()
                {
                    Id = -1,
                    Name = "",
                    Description = "",
                    ManagerId = "",
                    Manager = "",
                };
            }
            else
            {
                return Map(_context.Projects.Include(x=>x.Manager).FirstOrDefault(x => x.Id == id));
            }
        }

        public void AddUsersToProject(long projectId, List<string> userIds)
        {
            foreach (string userId in userIds)
            {
                _context.ProjectUsers.Add(new ProjectUser()
                {
                    ProjectId = projectId,
                    UserId = userId,
                });
            }

            _context.SaveChanges();
        }

        public bool CanEditProject(long projectId, List<string> currentUserRoles, string currentUserId)
        {
            var project = _context.Projects.FirstOrDefault(x => x.Id == projectId);

            return currentUserRoles.Contains(RolesNames.Admin) ||
                   (currentUserRoles.Contains(RolesNames.Manager) && project.ManagerId == currentUserId);
        }

        public List<EmployeeUserDto> GetProjectUsers(long id)
        {
            if (id==-1 || id==0)
            {
                return _context.Users.ToList().Select(x => _employeeUsersService.Map(x)).ToList();
            }

            var project = _context.Projects.Where(x => x.Id == id).Include(x => x.ProjectUsers)
                .ThenInclude(p => p.User).ThenInclude(x => x.Position).FirstOrDefault();

            return project.ProjectUsers.Select(x =>
            {
                var u = _employeeUsersService.Map(x.User);
                if (u.Id == project.ManagerId)
                    u.IsProjectManager = true;
                return u;
            }).ToList();
        }

        public void RemoveFromProject(string employeeId, long projectId)
        {
            _context.ProjectUsers.RemoveRange(_context.ProjectUsers.Where(x=>x.ProjectId==projectId && x.UserId == employeeId));
            _context.SaveChanges();
        }
        
        public List<EmployeeUserDto> GetUsersToChoose(long id)
        {
            return _context.Users.Include(x => x.ProjectUsers)
                .Include(x=>x.Position)
                .Where(x => !x.ProjectUsers.Any(p => p.ProjectId == id))
                .ToList()
                .Select(x => _employeeUsersService.Map(x))
                .ToList();
        }

    }
}
