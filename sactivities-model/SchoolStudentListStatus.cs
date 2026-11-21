using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace MeraatWebApplication.Data.Models.School
{
    public class SchoolStudentListStatus
    {
        [JsonProperty(Order = 6)]
        public long HeadGradeId { get; set; }
         [JsonProperty(Order = 1)]
        public string HeadGradeCaption { get; set; }
        [JsonProperty(Order = 2)]
        public int RegisteredCount { get; set; }
        [JsonProperty(Order = 3)]
        public int Entrd { get; set; }
        [JsonProperty(Order = 4)]
        public int Stat { get; set; }
    }
}
