using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Employees.Services
{
    public class EmailService
    {
        private string MailAddress = "";
        private string Password = "";
        private bool Ssl = true;
        /// <summary>
        /// "smtp.gmail.com" for gmail
        /// "smtp.mail.ru" for email
        /// </summary>
        private string Smtp = "smtp.gmail.com";
        /// <summary>
        /// 587 for gmail
        /// 25 for email and Ssl = true
        /// 465 for email
        /// </summary>
        private int Port = 587;

        public bool SendReport(List<Attach> attachs, List<string> userMails,out string error,string body="", string subject="")
        {
            error = "";
            MailMessage message = new MailMessage
            {
                Subject = string.IsNullOrEmpty(subject) ? "Отчет" : subject,
                Body = body,
                From = new MailAddress(MailAddress, "СУРС")
            };

            foreach (var mail in userMails)
            {
                message.To.Add(mail);
            }

            foreach(var attach in attachs)
            {
                message.Attachments.Add(new Attachment(new MemoryStream(attach.file), attach.name));
            }

            SmtpClient smtp = new SmtpClient(Smtp, Port)
            {
                Credentials = new NetworkCredential(MailAddress, Password),
                EnableSsl = Ssl
            };
            try
            {
                smtp.Send(message);
                return true;
            }
            catch(Exception ex)
            {
                error = ex.Message;
                return false;
            }
        }
    }

    public class Attach
    {
        public byte[] file;
        public string name;
    }
}
