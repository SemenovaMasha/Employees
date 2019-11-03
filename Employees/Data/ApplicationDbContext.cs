using System;
using System.Collections.Generic;
using System.Text;
using Employees.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Employees.Data
{
    public class ApplicationDbContext : IdentityDbContext<EmployeeUser>
    {
        public DbSet<Position> Positions { get; set; }
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
    }

    public static class MyIdentityDataInitializer
    {
        public static void SeedData(UserManager<EmployeeUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            SeedRoles(roleManager);
            SeedUsers(userManager);
        }

        public static void SeedUsers(UserManager<EmployeeUser> userManager)
        {
            if (userManager.FindByNameAsync("admin").Result == null)
            {
                EmployeeUser user = new EmployeeUser();
                user.UserName = "admin";
                user.Email = "admin@mail.ru";
                user.FIO = "admin";

                IdentityResult result = userManager.CreateAsync(user, "admin").Result;

                if (result.Succeeded)
                {
                    userManager.AddToRoleAsync(user, RolesNames.Admin).Wait();
                }
            }
            if (userManager.FindByNameAsync("user").Result == null)
            {
                EmployeeUser user = new EmployeeUser();
                user.UserName = "user";
                user.Email = "user@mail.ru";
                user.FIO = "user";

                IdentityResult result = userManager.CreateAsync(user, "user").Result;

                if (result.Succeeded)
                {
                    userManager.AddToRoleAsync(user, RolesNames.Employee).Wait();
                }
            }
        }

        public static void SeedRoles(RoleManager<IdentityRole> roleManager)
        {
            if (!roleManager.RoleExistsAsync(RolesNames.Admin).Result)
            {
                IdentityRole role = new IdentityRole();
                role.Name = RolesNames.Admin;
                IdentityResult roleResult = roleManager.CreateAsync(role).Result;
            }

            if (!roleManager.RoleExistsAsync(RolesNames.Manager).Result)
            {
                IdentityRole role = new IdentityRole();
                role.Name = RolesNames.Manager;
                IdentityResult roleResult = roleManager.CreateAsync(role).Result;
            }

            if (!roleManager.RoleExistsAsync(RolesNames.Employee).Result)
            {
                IdentityRole role = new IdentityRole();
                role.Name = RolesNames.Employee;
                IdentityResult roleResult = roleManager.CreateAsync(role).Result;
            }
        }
    }
}
