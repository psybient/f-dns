using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeraatWebApplication.Data.Models.School
{
    public class SActiveYearLog
    {
        public long CenterId { get; set; }
        public int SelectedActiveYearByUser { get; set; }
        public int ActiveYear { get; set; }
        public string ActiveYearDsc { get; set; }
    }
}
