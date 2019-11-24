using Employees.Data;
using Employees.Models;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Employees.Services
{
    internal class TaskDateChecker : IHostedService, IDisposable
    {
        private Timer _timer;
        private ApplicationDbContext _context;
        private readonly IServiceScopeFactory _scopeFactory;

        public TaskDateChecker(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
            var scope = scopeFactory.CreateScope();
            _context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _timer = new Timer(DoWork, null, TimeSpan.Zero,
                TimeSpan.FromSeconds(30));

            return Task.CompletedTask;
        }

        private void DoWork(object state)
        {
            foreach (var task in _context.TaskModels.Include(x=>x.TaskUsers))
            {
                var estimated = Convert.ToInt32(((task.Date - task.CreatedDate) ?? new TimeSpan(0)).TotalDays);
                if (estimated == 0) estimated = 1;
                var elapsed = Convert.ToInt32(((DateTime.Now - task.CreatedDate) ?? new TimeSpan(0)).TotalDays);
                if (elapsed / estimated * 100 > 50)
                {
                    foreach (var taskUser in task.TaskUsers)
                    {
                        Notification notification = new Notification()
                        {
                            Date = DateTime.Now,
                            Name = "Задача скоро просрочится!",
                            New = true,
                            UserId = taskUser.UserId,
                            Text = $"Планируемая дата выполнения задачи с номером '{task.TaskNumber}' - '{task.Date.Value.ToString("dd.MM.yyyy")}' "
                                   +Environment.NewLine+
                                   ((elapsed-estimated<0)?$"Дней осталось: {elapsed - estimated} ":$"(Просрочено дней: {estimated- elapsed})")
                        };
                        _context.Notifications.Add(notification);
                    }

                }
            }

            RemoveOld();

            _context.SaveChanges();
        }

        private void RemoveOld()
        {
            //foreach (var employeeUser in _context.Users)
            //{
            //    _context.Notifications.RemoveRange(
            //        _context.Notifications.Where(x => x.UserId == employeeUser.Id && (!x.New)
            //            && (Convert.ToInt32(((DateTime.Now - x.Date).TotalDays))) >= 7));
            //}
            _context.Notifications.RemoveRange(
                _context.Notifications.Where(x =>  (!x.New)
                    && (Convert.ToInt32(((DateTime.Now - x.Date).TotalDays))) >= 7).ToList());
        
    }

        public Task StopAsync(CancellationToken cancellationToken)
        {

            _timer?.Change(Timeout.Infinite, 0);

            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}
