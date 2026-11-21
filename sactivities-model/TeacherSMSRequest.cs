using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeraatWebApplication.Data.Models.School
{
    public class TeacherSMSRequest
    {
        public string Key { get; set; }
        public string CellphoneNumber { get; set; }
        public string TeacherName { get; set; }
        public string KarpoosheLink { get; set; }
        public string SchoolName { get; set; }
    }
}
