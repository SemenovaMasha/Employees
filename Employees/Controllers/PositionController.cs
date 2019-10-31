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
    }
}
