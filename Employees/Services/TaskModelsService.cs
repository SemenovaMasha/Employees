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
using Org.BouncyCastle.Asn1;
using TaskStatus = Employees.Models.TaskStatus;

namespace Employees.Services
{
    public class TaskModelsService
    {
        private ApplicationDbContext _context;
        private UserManager<EmployeeUser> _userManager;
        private EmployeeUsersService _employeeUsersService;

        public TaskModelsService(ApplicationDbContext _context, UserManager<EmployeeUser> _userManager, EmployeeUsersService _employeeUsersService)
        {
            this._context = _context;
            this._userManager = _userManager;
            this._employeeUsersService = _employeeUsersService;
        }

        public TaskModel Map(TaskModelDto dto)
        {
            TaskModel user =  _context.TaskModels.FirstOrDefault(x => x.Id == dto.Id);
            if (user == null)
            {
                user = new TaskModel();
            }

            user.TaskNumber = dto.TaskNumber;
            user.ProjectId = dto.ProjectId;
            user.TaskName = dto.TaskName;
            user.TaskDescription = dto.TaskDescription;
            user.Type = (TaskType)dto.Type;
            user.Priority = (TaskPriority)dto.Priority;
            user.Complexity = (TaskComplexity)dto.Complexity;
            user.Status = (TaskStatus)dto.Status;
            user.EstimatedTime = dto.EstimatedTime;
            user.ParentId = dto.ParentId==-1?null: dto.ParentId;
            user.Date = dto.Date;

            return user;
        }

        public TaskModelDto Map(TaskModel model,bool progress=false)
        {
            int ProgressValue = 0;
            int DateProgressMax = 0;
            int DateProgressValue = 0;
            int ProgressMax = 0;
            if (progress)
            {
                ProgressMax = GetAllEstimatedTime(model.Id);
                ProgressValue = GetAllElapsedTime(model.Id);

                DateProgressMax = GetAllEstimatedDate(model.Id);
                DateProgressValue = GetAllElapsedDate(model.Id);
            }
            return new TaskModelDto()
            {
                Id = model.Id,
                TaskNumber = model.TaskNumber,
                ProjectId = model.ProjectId,
                Project = model.Project?.Name,
                TaskName = model.TaskName,
                TaskDescription = model.TaskDescription,
                Priority = (int)model.Priority,
                PriorityName = model.Priority.GetDescription(),
                Type = (int)model.Type,
                TypeName = model.Type.GetDescription(),
                Complexity = (int)model.Complexity,
                ComplexityName = model.Complexity.GetDescription(),
                Status = (int)model.Status,
                StatusName = model.Status.GetDescription(),
                EstimatedTime = model.EstimatedTime,
                ParentId = model.ParentId,
                Parent = model.Parent?.TaskNumber,
                ProgressValue = ProgressValue,
                ProgressMax = ProgressMax,
                DateProgressValue = DateProgressValue,
                DateProgressMax = DateProgressMax,
                Date = model.Date,
                CreatedDate = model.CreatedDate,
                FullEstimatedTime = ProgressMax,
                FullDate = model.Id==-1 ?model.Date:GetLastEstimatedDate(model.Id,DateTime.Now),
                HasChilds = model.Id==-1 || _context.TaskModels.Any(x=>x.ParentId==model.Id),
            };
        }

        private int GetAllEstimatedTime(long id)
        {
            TaskModel TaskModel = _context.TaskModels.FirstOrDefault(x => x.Id == id);
            var childs = _context.TaskModels.Where(x => x.ParentId == id);
            int res = TaskModel.EstimatedTime;
            foreach (var child in childs)
            {
                res += GetAllEstimatedTime(child.Id);
            }

            return res;
        }

        internal EstimateDto TimeMatch(long id)
        {
            TaskModel taskModel = _context.TaskModels.FirstOrDefault(x => x.Id == id);
            var est = GetEstimate(new EstimateDataDto()
            {
                Id = id,
                Priority = (int) taskModel.Priority,
                Complexity = (int) taskModel.Complexity,
                Type = (int) taskModel.Type,
            });

            est.Match = taskModel.EstimatedTime >= est.Minutes;
            return  est;
        }

        private DateTime GetLastEstimatedDate(long id, DateTime max)
        {
            TaskModel TaskModel = _context.TaskModels.FirstOrDefault(x => x.Id == id);
            var childs = _context.TaskModels.Where(x => x.ParentId == id);
            DateTime res = new[] {(TaskModel.Date ?? DateTime.MinValue), max}.Max();
            foreach (var child in childs)
            {
                res = GetLastEstimatedDate(child.Id,res);
            }

            return res;
        }

        internal EstimateDto GetEstimate(EstimateDataDto dto)
        {
            int baseMinutes = 2000;

            if (dto.Complexity > 0) baseMinutes += 500 * dto.Complexity;

            if (dto.Priority == (int)TaskPriority.Critical) baseMinutes -= 700;
            if (dto.Priority == (int)TaskPriority.High) baseMinutes -= 300;
            if (dto.Priority == (int)TaskPriority.Low) baseMinutes += 300;

            if (dto.Type == (int) TaskType.Implementation) baseMinutes += 300;

            if (!MatchUsers(dto)) baseMinutes = (int)(baseMinutes*1.5);

            int days = baseMinutes / 480 +1;

            DateTime createdDate = DateTime.Now;

            if (dto.Id != -1)
            {
                var c = _context.TaskModels.Where(x => x.Id == dto.Id).FirstOrDefault().CreatedDate;
                if(c.HasValue) createdDate = c.Value;
            }

            return  new EstimateDto()
            {
                Minutes = baseMinutes,
                Date = AddWorkdays(createdDate,days),
            };
        }

        public bool MatchUsers(EstimateDataDto dto)
        {
            if (dto.Id == -1) return true;

            //если ни в одной подзадаче и в текущей нет сотрудника нужного уровня
            return TaskMatch(dto.Id, dto);
        }

        private bool TaskMatch(long taskId, EstimateDataDto dto)
        {
            TaskModel task = _context.TaskModels
                .Include(x=>x.TaskUsers)
                .Where(x => x.Id == taskId).FirstOrDefault();
            foreach (var taskUser in task.TaskUsers)
            {
                EmployeeUser user = _context.Users.FirstOrDefault(x => x.Id == taskUser.UserId);
                if (UserMatch(user, dto)) return true;
            }

            foreach (var child in _context.TaskModels.Where(x=>x.ParentId==task.Id))
            {
                if (TaskMatch(child.Id, dto)) return true;
            }

            return false;
        }

        private bool UserMatch(EmployeeUser user, EstimateDataDto dto)
        {
            if (dto.Complexity > 2 || (dto.Priority == (int)TaskPriority.Critical))
            {
                return user.Level == Level.Senior && user.Experience > 3;
            }
            if (dto.Complexity > 1 || (dto.Priority == (int)TaskPriority.High))
            {
                return user.Level >= Level.Middle && user.Experience > 1.5m;
            }
            if (dto.Complexity > 0 || (dto.Priority == (int)TaskPriority.Usual))
            {
                return user.Level >= Level.Junior && user.Experience > 0.5m;
            }

            return true;
        }

        public DateTime AddWorkdays(DateTime originalDate, int workDays)
        {
            DateTime tmpDate = originalDate;
            while (workDays > 0)
            {
                tmpDate = tmpDate.AddDays(1);
                if (tmpDate.DayOfWeek < DayOfWeek.Saturday &&
                    tmpDate.DayOfWeek > DayOfWeek.Sunday)
                    workDays--;
            }
            return tmpDate;
        }

        private int GetAllElapsedTime(long id)
        {
            TaskModel TaskModel = _context.TaskModels.FirstOrDefault(x => x.Id == id);
            var childs = _context.TaskModels.Where(x => x.ParentId == id);
            int res = _context.Labors.Where(x => x.TaskModelId == id).Sum(x => x.ElapsedTime);
            foreach (var child in childs)
            {
                res += GetAllElapsedTime(child.Id);
            }

            return res;
        }

        private int GetAllEstimatedDate(long id)
        {
            TaskModel taskModel = _context.TaskModels.FirstOrDefault(x => x.Id == id);
            return Convert.ToInt32(((taskModel.Date - taskModel.CreatedDate) ?? new TimeSpan(0)).TotalDays);
        }
        private int GetAllElapsedDate(long id)
        {
            TaskModel taskModel = _context.TaskModels.FirstOrDefault(x => x.Id == id);
            return Convert.ToInt32(((DateTime.Now - taskModel.CreatedDate) ?? new TimeSpan(0)).TotalDays);
        }


        public List<TaskModelDto> GetAllByUser(string id)
        {
            return _context.TaskModels.Include(x => x.TaskUsers)
                .Include(x => x.Project).Include(x => x.Parent)
                .Where(x=>x.TaskUsers.Any(p=>p.UserId==id))
                .ToList().Select(x => Map(x,true)).ToList();
        }

        public List<TaskModelDto> GetAll()
        {
            return _context.TaskModels.Include(x => x.Project).Include(x => x.Parent).ToList().Select(x => Map(x,true)).ToList();
        }
        
        public TaskModelDto Add(TaskModelDto dto, EmployeeUser currentUser)
        {
            TaskModel TaskModel = Map(dto);
            TaskModel.CreatedDate=DateTime.Now;
            _context.TaskModels.Add(TaskModel);
            _context.TaskUsers.Add(new TaskUser()
            {
                TaskModelId = TaskModel.Id,
                UserId = currentUser.Id
            });
            _context.SaveChanges();
            return Map(TaskModel);
        }

        public List<TaskModelDto> GetParents(long id)
        {
            if(id==-1)
                return _context.TaskModels.ToList().Select(x => Map(x,false)).ToList();


            List<long> childIds =new List<long>(){id};
            GetAllChilds(id, childIds);

            return _context.TaskModels.Where(x=>!childIds.Contains(x.Id)).ToList().Select(x => Map(x,false)).ToList();
        }

        private void GetAllChilds(long id, List<long> childIds)
        {
            var childs =_context.TaskModels.Where(x => x.ParentId == id);

            foreach (var child in childs)
            {
                if(!childIds.Contains(child.Id))
                    childIds.Add((child.Id));
                GetAllChilds(child.Id, childIds);
            }
        }

        public List<TaskModelDto> GetTaskModelSub(long id)
        {
            return _context.TaskModels.Where(x => x.ParentId == id).ToList().Select(x=>Map(x,true)).ToList();
        }

        public List<EnumDto> GetAllComplexitys()
        {
            return Enum.GetValues(typeof(TaskComplexity)).Cast<TaskComplexity>().Select(x => new EnumDto()
            {
                Id = (int)x,
                Name = x.GetDescription()
            }).ToList();
        }

        public TaskModelDto Delete(long id)
        {
            var res = Map(_context.TaskModels.FirstOrDefault(x => x.Id == id));
            DeleteRecursive(id);
            _context.SaveChanges();
            return res;
        }

        private void DeleteRecursive(long Id)
        {
            foreach (var t in _context.TaskModels.Where(x => x.ParentId == Id))
            {
                DeleteRecursive(t.Id);
            }

            TaskModel TaskModel = _context.TaskModels.FirstOrDefault(x => x.Id == Id);
            _context.TaskModels.Remove(TaskModel);
        }

        //public List<TaskModelDto> GetTaskModelByManager(string id)
        //{
        //    return _context.TaskModels
                
        //        .Include(x => x.Manager).Where(x=>x.ManagerId == id).ToList().Select(x => Map(x)).ToList();
        //}

        public TaskModelDto Update(TaskModelDto dto)
        {
            TaskModel TaskModel = Map(dto);
            _context.TaskModels.Update(TaskModel);


            _context.SaveChanges();
            return Map(TaskModel,true);
        }

        public TaskModelDto Get(long id)
        {
            if (id==-1)
            {
                return new TaskModelDto()
                {
                    Id = -1,
                    ProjectId = -1,
                    Project = "",
                    Priority = (int)TaskPriority.Usual,
                    Complexity = (int)TaskComplexity.Three,
                    ComplexityName = TaskComplexity.Three.GetDescription(),
                    EstimatedTime = 0,
                    Parent = "",
                    ParentId = -1,
                    TaskDescription = "",
                    TaskName = "",
                    TaskNumber = "",
                    PriorityName = TaskPriority.Usual.GetDescription(),
                    Type = (int)TaskType.Other,
                    TypeName = TaskType.Other.GetDescription(),
                    Status = (int)TaskStatus.Open,
                    StatusName = TaskStatus.Open.GetDescription(),
                };
            }
            else
            {
                return Map(_context.TaskModels.Include(x => x.Project).Include(x => x.Parent).FirstOrDefault(x => x.Id == id),true);
            }
        }

        public void AddUsersToTaskModel(long TaskModelId, List<string> userIds)
        {
            foreach (string userId in userIds)
            {
                _context.TaskUsers.Add(new TaskUser()
                {
                    TaskModelId = TaskModelId,
                    UserId = userId,
                });
            }

            _context.SaveChanges();
        }

        //public bool CanEditTaskModel(long TaskModelId, List<string> currentUserRoles, string currentUserId)
        //{
        //    var TaskModel = _context.TaskModels.FirstOrDefault(x => x.Id == TaskModelId);

        //    return currentUserRoles.Contains(RolesNames.Admin) ||
        //           (currentUserRoles.Contains(RolesNames.Manager) && TaskModel.ManagerId == currentUserId);
        //}

        public List<EmployeeUserDto> GetTaskModelUsers(long id)
        {
            if (id==-1 || id==0)
            {
                return _context.Users.ToList().Select(x => _employeeUsersService.Map(x)).ToList();
            }

            var TaskModel = _context.TaskModels.Where(x => x.Id == id).Include(x => x.TaskUsers)
                .ThenInclude(p => p.User).ThenInclude(x => x.Position).FirstOrDefault();

            return TaskModel.TaskUsers.Select(x => _employeeUsersService.Map(x.User)).ToList();
        }

        public void RemoveFromTaskModel(string employeeId, long TaskModelId)
        {
            _context.TaskUsers.RemoveRange(_context.TaskUsers.Where(x=>x.TaskModelId==TaskModelId && x.UserId == employeeId));
            _context.SaveChanges();
        }
        
        public List<EmployeeUserDto> GetUsersToChoose(long taskModelId)
        {
            var taskModel = _context.TaskModels.FirstOrDefault(x => x.Id == taskModelId);

            var list = _context.Users.Include(x => x.TaskUsers).Include(x => x.ProjectUsers)
                .Include(x=>x.Position)
                .Where(x => !x.TaskUsers.Any(p => p.TaskModelId == taskModel.Id)&& x.ProjectUsers.Any(p => p.ProjectId == taskModel.ProjectId))
                .ToList();
            
            return list
                .Select(x =>
                {
                    var tmp = _employeeUsersService.Map(x);
                    tmp.TaskMatch=UserMatch(x, MapToEstimateDataDto(taskModel));
                    return tmp;
                })
                .ToList();
        }

        private EstimateDataDto MapToEstimateDataDto(TaskModel model)
        {
            return new EstimateDataDto()
            {
                Id = model.Id,
                Priority = (int)(model.Priority),
                Complexity = (int)(model.Complexity),
                Type = (int)(model.Type),
            };
        }
    }
}
