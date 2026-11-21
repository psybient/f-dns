using Org.BouncyCastle.Asn1.X509;
using System;

namespace MeraatWebApplication.Data.Models.School
{
    public class CurrentServerDateTime
    {
        public DateTime GregorianDateTime { get; set; }
        public string GregorianDate { get; set; }
        public string PersianDateTime { get; set; }
        public TimeSpan LocalTime { get; set; }
    }
}
