using Employees.Data;
using Employees.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Employees.Models.Dto;
using Microsoft.EntityFrameworkCore;

namespace Employees.Controllers
{
    public class BonusSettingsController: Controller
    {
        private ApplicationDbContext _context;
        public BonusSettingsController(ApplicationDbContext _context)
        {
            this._context = _context;
        }

        private BonusSettings Map(BonusSettingsDto dto)
        {
            BonusSettings bonus = _context.BonusSettings.FirstOrDefault(x => x.Id == dto.Id);
            if (bonus == null)
            {
                bonus = new BonusSettings();
            }

            bonus.BonusPercent = dto.BonusPercent;
            bonus.Coef = dto.Coef;
            bonus.DeltaPercent = dto.DeltaPercent;
            bonus.ProjectId = dto.ProjectId;

            return bonus;
        }

        private BonusSettingsDto Map(BonusSettings model)
        {
            return new BonusSettingsDto()
            {
                Id = model.Id,
                Project = model.Project?.Name,
                ProjectId = model.ProjectId,
                BonusPercent = model.BonusPercent,
                DeltaPercent = model.DeltaPercent,
                Coef = model.Coef,
            };
        }

        [Authorize(Roles = RolesNames.Admin)]
        public ActionResult Index()
        {
            return View();
        }

        public List<BonusSettingsDto> GetAll()
        {
            return _context.BonusSettings.Include(x=>x.Project).ToList().Select(x=>Map(x)).ToList();
        }

        [HttpPost]
        public BonusSettingsDto Add([FromBody]BonusSettingsDto bonus)
        {
            BonusSettings model = Map(bonus);
            _context.BonusSettings.Add(model);
            _context.SaveChanges();
            var dto = Map(model);
            dto.Project = bonus.Project;
            return dto;
        }

        public BonusSettingsDto Delete(long id)
        {
            BonusSettings deleted = _context.BonusSettings.FirstOrDefault(x => x.Id == id);
            if (deleted == null)
                return null;

            _context.BonusSettings.Remove(deleted);
            _context.SaveChanges();
            return Map(deleted);
        }

        [HttpPost]
        public BonusSettingsDto Update([FromBody]BonusSettingsDto bonus)
        {
            BonusSettings model = Map(bonus);
            _context.BonusSettings.Update(model);
            _context.SaveChanges();
            var dto = Map(model);
            dto.Project = bonus.Project;
            return dto;
        }
    }
}
