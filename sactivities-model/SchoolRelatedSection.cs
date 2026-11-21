using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeraatWebApplication.Data.Models.School
{
    public class SchoolRelatedSection
    {
        public long GradeFieldId { get; set; }
        public string Caption { get; set; }
        public int MaxClassNum {get; set;}
        public int IsLock { get; set; }
    }
}
