using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeraatWebApplication.Data.Models.School
{
    public class TeacherInfo
    {
        public long CenterTeacherId { get; set; }
        public string FullName { get; set; }
        public string KarpoosheLink { get; set; }
        public string Cellphone { get; set; }
        public string CurrentWeek { get; set; }
        public long ReportCount { get; set; }
        public long KarpoosheCount { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string CenterName { get; set; }
        public IEnumerable<TeacherInfo_l2> l2 { get; set; }
    }
    public class TeacherInfo_l2
    {
        public long TeacherGradeLessonDetailId { get; set; }
        public long CenterTeacherId { get; set; }
        public string GradeLessonDetailCaption { get; set; }
        public string GradeFieldCaption { get; set; }
        public string ClassList { get; set; }
    }
    public class CenterGradeFieldId
    {
        public long GradeFieldId { get; set; }
        public string Caption { get; set; }
        public string SubCatValue { get; set; }
    }
}
