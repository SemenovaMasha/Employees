using Employees.Data;
using Employees.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Controllers
{
    public class PositionController: Controller
    {
        private ApplicationDbContext _context;
        public PositionController(ApplicationDbContext _context)
        {
            this._context = _context;
        }

        [Authorize(Roles = "Admin")]
        public ActionResult Index()
        {
            return View();
        }

        public List<Position> GetAll()
        {
            return _context.Positions.ToList();
        }

        [HttpPost]
        public Position Add([FromBody]Position position)
        {
            position.Id = 0;
            _context.Positions.Add(position);
            _context.SaveChanges();
            return position;
        }

        public Position Delete(long id)
        {
            Position deleted = _context.Positions.FirstOrDefault(x => x.Id == id);
            if (deleted == null)
                return null;

            _context.Positions.Remove(deleted);
            _context.SaveChanges();
            return deleted;
        }

        [HttpPost]
        public Position Update([FromBody]Position position)
        {
            _context.Positions.Update(position);
            _context.SaveChanges();
            return position;
        }
    }
}
