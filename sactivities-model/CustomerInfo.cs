namespace MeraatWebApplication.Data.Models.School
{
    using System.ComponentModel.DataAnnotations;
    using System;

    public class CustomerInfoDraftInfo
    {
        public string Property { get; set; }
        public string Value { get; set; }
    }

    public class CustomerInfo
    {

        [Display(Name = "section_code", Description = "section_code")]
        public int section_code { set; get; }

        [Display(Name = "school_state", Description = "school_state")]
        public Nullable<int> school_state { set; get; }

        [Display(Name = "school_city", Description = "school_city")]
        public Nullable<int> school_city { set; get; }

        [Display(Name = "school_name", Description = "school_name")]
        public string school_name { set; get; }

        [Display(Name = "school_training", Description = "school_training")]
        public Nullable<int> school_training { set; get; }

        [Display(Name = "school_gender", Description = "school_gender")]
        public Nullable<int> school_gender { set; get; }

        [Display(Name = "M3x_tel", Description = "M3x_tel")]
        public string M3x_tel { set; get; }

        //[Display(Name = "M30_tel", Description = "M30_tel")]
        //public string M30_tel { set; get; }
        //[Display(Name = "M31_tel", Description = "M31_tel")]
        //public string M31_tel { set; get; }
        //[Display(Name = "M32_tel", Description = "M32_tel")]
        //public string M32_tel { set; get; }
        //[Display(Name = "M33_tel", Description = "M33_tel")]
        //public string M33_tel { set; get; }
        //[Display(Name = "M34_tel", Description = "M34_tel")]
        //public string M34_tel { set; get; }


        [Display(Name = "M3x_zip", Description = "M3x_zip")]
        public string M3x_zip { set; get; }

        //[Display(Name = "M30_zip", Description = "M30_zip")]
        //public string M30_zip { set; get; }
        //[Display(Name = "M31_zip", Description = "M31_zip")]
        //public string M31_zip { set; get; }
        //[Display(Name = "M32_zip", Description = "M32_zip")]
        //public string M32_zip { set; get; }
        //[Display(Name = "M33_zip", Description = "M33_zip")]
        //public string M33_zip { set; get; }
        //[Display(Name = "M34_zip", Description = "M34_zip")]
        //public string M34_zip { set; get; }



        [Display(Name = "M3x_address", Description = "M3x_address")]
        public string M3x_address { set; get; }

        //[Display(Name = "M30_address", Description = "M30_address")]
        //public string M30_address { set; get; }
        //[Display(Name = "M31_address", Description = "M31_address")]
        //public string M31_address { set; get; }
        //[Display(Name = "M32_address", Description = "M32_address")]
        //public string M32_address { set; get; }
        //[Display(Name = "M33_address", Description = "M33_address")]
        //public string M33_address { set; get; }

        //[Display(Name = "M34_address", Description = "M34_address")]
        //public string M34_address { set; get; }


        [Display(Name = "U1x_Gender", Description = "U1x_Gender")]
        public Nullable<int> U1x_Gender { set; get; }

        [Display(Name = "U2x_Gender", Description = "U2x_Gender")]
        public Nullable<int> U2x_Gender { set; get; }


        [Display(Name = "U1x_Name", Description = "U1x_Name")]
        public string U1x_Name { set; get; }

        [Display(Name = "U2x_Name", Description = "U2x_Name")]
        public string U2x_Name { set; get; }


        //[Display(Name = "U10_Name", Description = "U10_Name")]
        //public string U10_Name { set; get; }
        //[Display(Name = "U11_Name", Description = "U11_Name")]
        //public string U11_Name { set; get; }
        //[Display(Name = "U12_Name", Description = "U12_Name")]
        //public string U12_Name { set; get; }
        //[Display(Name = "U13_Name", Description = "U13_Name")]
        //public string U13_Name { set; get; }
        //[Display(Name = "U14_Name", Description = "U14_Name")]
        //public string U14_Name { set; get; }



        [Display(Name = "U1x_Famili", Description = "U1x_Famili")]
        public string U1x_Famili { set; get; }

        [Display(Name = "U2x_Famili", Description = "U2x_Famili")]
        public string U2x_Famili { set; get; }

        //[Display(Name = "U10_Famili", Description = "U10_Famili")]
        //public string U10_Famili { set; get; }
        //[Display(Name = "U11_Famili", Description = "U11_Famili")]
        //public string U11_Famili { set; get; }
        //[Display(Name = "U12_Famili", Description = "U12_Famili")]
        //public string U12_Famili { set; get; }
        //[Display(Name = "U13_Famili", Description = "U13_Famili")]
        //public string U13_Famili { set; get; }
        //[Display(Name = "U14_Famili", Description = "U14_Famili")]
        //public string U14_Famili { set; get; }


        [Display(Name = "U1x_Cell", Description = "U1x_Cell")]
        public string U1x_Cell { set; get; }

        [Display(Name = "U2x_Cell", Description = "U2x_Cell")]
        public string U2x_Cell { set; get; }


        //[Display(Name = "U10_Cell", Description = "U10_Cell")]
        //public string U10_Cell { set; get; }
        //[Display(Name = "U11_Cell", Description = "U11_Cell")]
        //public string U11_Cell { set; get; }
        //[Display(Name = "U12_Cell", Description = "U12_Cell")]
        //public string U12_Cell { set; get; }
        //[Display(Name = "U13_Cell", Description = "U13_Cell")]
        //public string U13_Cell { set; get; }
        //[Display(Name = "U14_Cell", Description = "U14_Cell")]
        //public string U14_Cell { set; get; }


        [Display(Name = "U1x_Email", Description = "U1x_Email")]
        public string U1x_Email { set; get; }

        [Display(Name = "U2x_Email", Description = "U2x_Email")]
        public string U2x_Email { set; get; }


        //[Display(Name = "U10_Email", Description = "U10_Email")]
        //public string U10_Email { set; get; }
        //[Display(Name = "U11_Email", Description = "U11_Email")]
        //public string U11_Email { set; get; }
        //[Display(Name = "U12_Email", Description = "U12_Email")]
        //public string U12_Email { set; get; }
        //[Display(Name = "U13_Email", Description = "U13_Email")]
        //public string U13_Email { set; get; }
        //[Display(Name = "U14_Email", Description = "U14_Email")]
        //public string U14_Email { set; get; }


        [Display(Name = "U1x_UserName", Description = "U1x_UserName")]
        public string U1x_UserName { set; get; }


        [Display(Name = "U1x_PassWord", Description = "U1x_PassWord")]
        public string U1x_PassWord { set; get; }

    }
}
