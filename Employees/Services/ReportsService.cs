using Employees.Data;
using Employees.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Employees.Services
{
    public class ReportsService
    {
        private ApplicationDbContext _context;
        private UserManager<EmployeeUser> _userManager;

        public ReportsService(ApplicationDbContext _context, UserManager<EmployeeUser> _userManager)
        {
            this._context = _context;
            this._userManager = _userManager;
        }

        public DataTable GetReportTable()
        {
            using (var connection = _context.Database.GetDbConnection())
            {
                connection.Open();

                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = "SELECT * from labors";
                    //using (var reader = cmd.ExecuteReader())
                    //{
                    //    while (reader.Read())
                    //    {                            
                    //    }
                    //}

                    using (var reader = cmd.ExecuteReader())
                    {
                        var dataTable = new DataTable();
                        dataTable.Load(reader);
                        return dataTable;
                    }
                }
            }
        }
        //public void GetReportTable()
        //{
        //    using (var connection = _context.Database.GetDbConnection())
        //    {
        //        connection.Open();

        //        using (var cmd = connection.CreateCommand())
        //        {
        //            cmd.CommandText = "SELECT * from labors";
        //            //using (var reader = cmd.ExecuteReader())
        //            //{
        //            //    while (reader.Read())
        //            //    {                            
        //            //    }
        //            //}

        //            using (var reader = cmd.ExecuteReader())
        //            {
        //                var dataTable = new DataTable();
        //                dataTable.Load(reader);
        //            }
        //        }
        //    }
        //}

        //private
    }

}
