using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeraatWebApplication.Data.Models.School
{
    public class AppOnlineTestActivityGroup
    {
        public long GradeFieldId { get; set; }
        public string GradeFieldCaption { get; set; }
        public long ExamId { get; set; }
        public string ExamCaption { get; set; }
        public TimeSpan ExamTime { get; set; }
        public int RegisteredCount { get; set; }
        public string ExamShamsiDate { get; set; }
        public int RemainingDays { get; set; }
        public long CenterId { get; set; }
        public long CenterHeadGradeId { get; set; }
    }
    public class AppOnlineTestActivityDetail
    {
        public int Flag { get; set; }
        public string StudentName { get; set; }
        public int ClassNo { get; set; }
        public string StartDate { get; set; }
        public string FinishDate { get; set; }
        public bool LinkStatus { get; set; }
        public string Cellphone { get; set; }
        public long TestPersonId { get; set; }
    }


    public class AppOnlineDescriptiveTestActivityGroup
    {
        public IEnumerable<AppOnlineDescriptiveTestActivityGroupd_Live> live;
        public IEnumerable<AppOnlineDescriptiveTestActivityGroupd_History> History;
    }

    public class AppOnlineDescriptiveTestActivityGroupd_Live
    {
        public long TestGroupId { get; set; }
        public string TestGroupDescriptiveCaption { get; set; }


        public DateTime QuestionExamDate { get; set; }
        public string QuestionExamCaption { get; set; }
        public DateTime QuestionExamAccessDate { get; set; }
        public string QuestionExamLessonsCaption { get; set; }


        public DateTime AnswerExamDate { get; set; }
        public string AnswerExamCaption { get; set; }
        public DateTime AnswerExamAccessDate { get; set; }
        public string AnswerExamLessonsCaption { get; set; }
    }

    public class AppOnlineDescriptiveTestActivityGroupd_History
    {
        public long TestGroupId { get; set; }
        public string TestGroupDescriptiveCaption { get; set; }


        public DateTime QuestionExamDate { get; set; }
        public string QuestionExamCaption { get; set; }
        public DateTime QuestionExamAccessDate { get; set; }
        public string QuestionExamLessonsCaption { get; set; }


        public DateTime AnswerExamDate { get; set; }
        public string AnswerExamCaption { get; set; }
        public DateTime AnswerExamAccessDate { get; set; }
        public string AnswerExamLessonsCaption { get; set; }
    }


    public class AppOnlineDescriptiveBookletAddress
    {
        public long Id { get; set; }
        public string FileAddress { get; set; }
        public string DescriptiveFileId { get; set; }
        public string QuestionAnswerExamDate { get; set; }
        public long GradeLessonId { get; set; }
        public string BookletType { get; set; }
    }

}
