using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeraatWebApplication.Data.Models.School
{
    public class GradeFieldInfo
    {
        public long GradeFieldId { get; set; }
        public string Caption { get; set; }
        public InternalQuizInfo internalQuizInfo { get; set; }
    }
    public class InternalQuizInfo
    {
        public IEnumerable<ClassList> classList { get; set; }
        public IEnumerable<LessonList> lessonList { get; set; }
    }

    public class ClassList
    {
        public int ClassNo { get; set; }
        public int StudentCount { get; set; }
    }

    public class LessonList
    {
        public long GradeLessonDetailId { get; set; }
        public string Caption { get; set; }
        public bool Enabled { get; set; } = false;
        public IEnumerable<LessonStudyUnit> StudyUnit { get; set; }
    }
    public class LessonStudyUnit
    {
        public long Id { get; set; } 
        public string FullCaption { get; set; }
        public long SortOrder { get; set; }
    }

    public class InternalQuizInfoPosting
    {
        public string QuizCaption { get; set; }
        public long GradeFieldId { get; set; }
        public int MinSelfAssessmentCount { get; set; }
        public float MinStudyMinutes { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public IEnumerable<ClassList> classList { get; set; }
        public IEnumerable<LessonList> lessonList { get; set; }
    }

    public class GeneratedQuizInfo
    {
        public long Id { get; set; }
        public string QuizCaption { get; set; }
        public string ShamsiToDate { get; set; }
    }
    public class ExamHostName
    {
        public string EHostName { get; set; }
    }

}
