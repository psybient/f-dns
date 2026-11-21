using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeraatWebApplication.Data.Models.School
{
    public class StudentProfile
    {
        [JsonProperty(Order = 1)]
        public int Rank { get; set; }
        [JsonProperty(Order = 2)]
        public long CenterId { get; set; }
        [JsonProperty(Order = 3)]
        public long GradeFieldId { get; set; }
        [JsonProperty(Order = 4)]
        public  long TempNo { get; set; }
        [JsonProperty(Order = 5)]
        public string Name { get; set; }
        [JsonProperty(Order = 6)]
        public string Family { get; set; }
        [JsonProperty(Order = 7)]
        public string Father { get; set; }
        [JsonProperty(Order = 8)]
        public Nullable<int> Class { get; set; }
        [JsonProperty(Order = 9)]
        public int LockStatus { get; set; }
        [JsonProperty(Order = 10)]
        public string NationalCode { get; set; }
        [JsonProperty(Order = 11)]
        public bool Linked { get; set; }
        [JsonProperty(Order = 12)]
        public string UserName { get; set; }
        [JsonProperty(Order = 13)]
        public string Password { get; set; }
        [JsonProperty(Order = 14)]
        public bool MustBeReplaced { get; set; }
        [JsonProperty(Order = 15)]
        public string ReplacingMessage { get; set; }
        [JsonProperty(Order = 16)]
        public string TestPersonId { get; set; }
        [JsonProperty(Order = 17)]
        public string EncryptTestPersonId { get; set; }
        [JsonProperty(Order = 18)]
        public long TeacherStudentClassId { get; set; }
    }
}
