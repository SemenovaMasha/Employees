using Employees.Data;
using Employees.Models;
using Employees.Models.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Employees.Services
{
    public class EmployeeUsersService
    {
        private ApplicationDbContext _context;
        private UserManager<EmployeeUser> _userManager;

        public EmployeeUsersService(ApplicationDbContext _context, UserManager<EmployeeUser> _userManager)
        {
            this._context = _context;
            this._userManager = _userManager;
        }

        public EmployeeUser Map(EmployeeUserDto dto)
        {
            EmployeeUser user =  _context.Users.FirstOrDefault(x => x.Id == dto.Id);
            if (user == null)
            {
                user = new EmployeeUser();
                //user.Id = Guid.NewGuid().ToString();
            }

            user.FIO = dto.FIO;
            user.Email = dto.Mail;
            user.AdditionalInfo = dto.AdditionalInfo;
            user.PositionId = dto.PositionId;
            user.Address = dto.Address;
            user.BirthDate = dto.BirthDate;
            user.Education = dto.Education;
            user.PassportGiven = dto.PassportGiven;
            user.PassportSeriesNumber = dto.PassportSeriesNumber;
            user.Salary = dto.Salary;

            return user;
        }

        public EmployeeUserDto Map(EmployeeUser model)
        {
            return new EmployeeUserDto()
            {
                Id = model.Id,
                Mail = model.Email,
            FIO = model.FIO,
                AdditionalInfo = model.AdditionalInfo,
                PositionId = model.PositionId,
                Position = model.Position?.Name,
                Address = model.Address,
                BirthDate = model.BirthDate,
                Education = model.Education,
                PassportGiven = model.PassportGiven,
                PassportSeriesNumber = model.PassportSeriesNumber,
                Role = _userManager.GetRolesAsync(model).Result.FirstOrDefault(),
                Salary = model.Salary,
            };
        }

        public List<EmployeeUserDto> GetAll()
        {
            return _context.Users.Include(x => x.Position).ToList().Select(x => Map(x)).ToList();
        }

        public List<EmployeeUserDto> GetAllManagers()
        {
            return (_userManager.GetUsersInRoleAsync(RolesNames.Admin).Result.ToList()
                    .Union(_userManager.GetUsersInRoleAsync(RolesNames.Manager).Result.ToList())).Select(x => Map(x))
                .ToList();
        }

        public EmployeeUserDto Add(EmployeeUserDto dto)
        {
            EmployeeUser user = Map(dto);
            user.UserName = user.FIO;
            user.Email = dto.Mail;
            var res = _userManager.CreateAsync(user, user.FIO).Result;
            res = _userManager.AddToRoleAsync(user, dto.Role).Result;
            _context.SaveChanges();
            return Map(user);
        }

        public EmployeeUserDto Delete(string id)
        {
            EmployeeUser user = _context.Users.FirstOrDefault(x => x.Id == id);
            _context.Users.Remove(user);
            _context.SaveChanges();
            return Map(user);
        }
        
        public EmployeeUserDto Update(EmployeeUserDto dto)
        {
            EmployeeUser user = Map(dto);
            _context.Users.Update(user);

            var res = _userManager.RemoveFromRolesAsync(user, _userManager.GetRolesAsync(user).Result).Result;
            res = _userManager.AddToRoleAsync(user, dto.Role).Result;

            _context.SaveChanges();
            return Map(user);
        }

        public EmployeeUserDto Get(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return new EmployeeUserDto()
                {
                    Id = "",
                    PositionId = null,
                    FIO = "",
                    Education = "",
                    BirthDate = null,
                    PassportGiven = "",
                    PassportSeriesNumber = "",
                    AdditionalInfo = "",
                    Address = "",
                    Role = RolesNames.Employee,
                    Salary = 0,
                };
            }
            else
            {
                return Map(_context.Users.Include(x=>x.Position).FirstOrDefault(x => x.Id == id));
            }
        }
        

    }
}
