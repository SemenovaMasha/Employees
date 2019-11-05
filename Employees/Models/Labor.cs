using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Employees.Models
{
    public class Labor
    {
        [Key] public long Id { get; set; }
        public DateTime Date { get; set; }
        public Project Project { get; set; }
        public long ProjectId { get; set; }
        public string TaskNumber { get; set; }
        public string TaskName { get; set; }
        public TaskType Type { get; set; }
        public TaskPriority Priority { get; set; }
        public int EstimatedTime { get; set; }
        public int ElapsedTime { get; set; }
        public string Note { get; set; }
        public EmployeeUser User { get; set; }
        public string UserId { get; set; }
    }

    public enum TaskType
    {
        [Description("Другой")] Other = 0,

        [Description("Разработка")] Implementation = 1,

        [Description("Тестирование")] Testing = 2,
    }

    public enum TaskPriority
    {
        [Description("Обычный")] Usual = 0,

        [Description("Высокий")] High = 1,

        [Description("Низкий")] Low = 2,
    }

    public static class Enums
    {

        public static string GetDescription(this Enum enumElement)
        {
            Type type = enumElement.GetType();

            MemberInfo[] memInfo = type.GetMember(enumElement.ToString());
            if (memInfo != null && memInfo.Length > 0)
            {
                object[] attrs = memInfo[0].GetCustomAttributes(typeof(DescriptionAttribute), false);
                if (attrs != null && attrs.Length > 0)
                    return ((DescriptionAttribute)attrs[0]).Description;
            }

            return enumElement.ToString();
        }
    }
}
