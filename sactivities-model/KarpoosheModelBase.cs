using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeraatWebApplication.Data.Models.School
{
    public class KarpoosheDataCollection
    {
        public IEnumerable<KarpoosheModelBase> KarpoosheBase { get; set; }
    }
    public class KarpoosheModelBase
    {
        public long GradeFieldId { get; set; }
        public string GradeFieldCaption { get; set; }
        public long GradeLessonId { get; set; }
        public long GradeLessonDetailId { get; set; }
        public string LessonCaption { get; set; }
        public long SeasonCode { get; set; }
        public string SeasonCaption { get; set; }
        public long EducationalTreeId { get; set; }
        public string StudyUnitCaption { get; set; }
        public int LeafCount { get; set; }
        public long PersonRoleId { get; set; }
        public long StudyGradeLessonEducationalTreeId { set; get; }
        public int Duration { get; set; }
        public long ExamId { get; set; }
        public int ExamTypeId { get; set; }
        public string ExamTypeCaption { get; set; }
        public string ExamDate { get; set; }
        public long AnswerId { get; set; }
        public int RightAnswerCount { get; set; }
        public int WrongAnswerCount { get; set; }
        public int BlankAnswerCount { get; set; }
        public int DifficultyLevelId { get; set; }
        public string DifficultyLevelCaption { get; set; }
        public int StudentAnswer { get; set; }
        public long StudyId { get; set; }
        public long StudyReferenceId { get; set; }
        public string StudyReferenceCaption { get; set; }
        public long StudyTypeId { get; set; }
        public string StudyTypeCaption { get; set; }
        public long ReasonId { get; set; }
        public string ReasonCaption { get; set; }
        public long ContentDataId { get; set; }
        public long MediaId { get; set; }
        public string HashedMedia { get; set; }
        public int ContentNo { get; set; }
        public int SelectedOptionByStudent { get; set; }
        public int SeasonSortOrder { get; set; }
        public int SectionSortOrder { get; set; }
        public int SelfExamCount { get; set; }
        public int PublicExamCount { get; set; }
    }

    public class LessonHasNoQuestion
    {
        public long GradeLessonDetailId { get; set; }
    }

    public class Student
    {
        public long PersonRoleId { get; set; }
        public long TestPersonId { get; set; }
        public long GradeFieldId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EncryptTestPersonId { get; set; }
        public int TotalLeaftCount { get; set; }
        public int ClassNo { get; set; }
    }
}
