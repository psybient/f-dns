using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeraatWebApplication.Data.Models.School
{
    public class SchoolPresentTestReport
    {
        public int Id { get; set; }
        public long GroupId { get; set; }
        public string Title { get; set; }
        public string ExamDate { get; set; }
        public long TestGroup { get; set; }
        public long Type { get; set; }
        public long TestNo { get; set; }
        public IEnumerable<SchoolPresentTestReportData> Data { get; set; }
    }
    public class SchoolPresentTestReportData
    {
        public long Id { get; set; }
        public int TestNo { get; set; }
        public long GradeFieldId { get; set; }
        public long GradeLessonId { get; set; }
        public int ClassNo { get; set; }
        public string Caption { get; set; }
        public int BalanceScore { get; set; }
        public float AllPercent { get; set; }
        public int AllRank { get; set; }    
        public int StateRank { get; set; }
        public int CityRank { get; set; }
        public int GroupRank { get; set; }
        public int AllParticipant { get; set; }
        public int StateParticipant { get; set; }
        public int CityParticipant { get; set; }
        public string ExamDate { get; set; }
        public string FromDate { get; set; }
        public bool HasBeenPaid { get; set; }
        public bool IsLocked { get; set; }
        public bool IsCorrected { get; set; }
    }

    public class SchoolPresentTestChartData
    {
        public long Id { get; set; }
        public int TestNo { get; set; }
        public int ClassNo { get; set; }
        public int Rank { get; set; }
        public long GradeLessonId { get; set; }
        public long GradeFieldId { get; set; }
        public string Caption { get; set; }
        public string Title { get; set; }
        public int BalanceScore { get; set; }
        public int AllRank { get; set; }
        public int AllParticipant {get; set;}
        public int Type { get; set; }
        public string FileAddress { get; set; }
    }

    public class SchoolPresentTestReportPaidData
    {
        public int Status { get; set; }
        public int TestNo { get; set; }
    }


}
