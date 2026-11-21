using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeraatWebApplication.Data.Models.School
{
    public class SchoolLogo
    {
        public long Id { get; set; }
        public string FileExtension { get; set; }
        public bool IsEdited { get; set; }
    }
}
