using NPOI.SS.Formula.Functions;
using System;

namespace MeraatWebApplication.Data.Models.School
{
    public class ExamDelivaryTypes
    {
        public int Type { get; set; }
        public long Id { get; set; }
        public long AgencyCode { get; set; }
        public string caption { get; set; }
        public bool Selected { get; set; }
        public int SubCatValue { get; set; }
    }
}

