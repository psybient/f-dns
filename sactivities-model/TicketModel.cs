using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;

namespace MeraatWebApplication.Data.Models.School
{
    public class TicketList
    {
        public long Id { get; set; }
        public long FakeId { get; set; }
        public DateTime InsDate { get; set; }
        public string PersianCreateDate { get; set; }
        public string CreateDate_HoursAndMinutes { get; set; }
        public string PersianInsDate { get; set; }
        public string SolarInsDate { get; set; }
        public string HoursAndMinutes { get; set; }
        public long TicketStatusId { get; set; }
        public long PersonRoleId { get; set; }
        public long CenterId { get; set; }
        public long SectionId { get; set; }
        public long TopicId { get; set; }
        public string Subject { get; set; }
        public Nullable<bool> IsUserSatisfied { get; set; }
        public string StatusCaption { get; set; }
        public string RoleName { get; set; }
        public string TopicCaption { get; set; }
        public string CenterName { get; set; }
        public string StateName { get; set; }
        public string CityName { get; set; }
        public string SectionCaption { get; set; }
        public string SupporterFullName { get; set; }
        public long AssignedToPersonRoleId { get; set; }
        public string AssignedToFullName { get; set; }
        public bool Attention { get; set; }
        public bool ShouldClose { get; set; }
        public long RoleId { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string KarpoosheLink { get; set; }
        public int Flag { get; set; }

    }

    public class TicketDetail
    {
        public long Id { get; set; }
        public DateTime InsDate { get; set; }
        public string PersianInsDate { get; set; }
        public string SolarInsDate { get; set; }
        public string HoursAndMinutes { get; set; }
        public long TicketId { get; set; }
        public long SupporterPersonRoleId { get; set; }
        public string Description { get; set; }
        public bool IsUseful { get; set; }
        public bool ShouldClose { get; set; } // if it is true, new boxes apear
        public Nullable<bool> EmailSent { get; set; }
        public Nullable<bool> SMSSent { get; set; }
        public string Files { get; set; }
        public string[] FilesList { get; set; }
        public string Speaker { get; set; }
        public bool CouldDelete { get; set; }
        public bool HasEmail { get; set; }
        public bool HasCellPhone { get; set; }
        public bool IsStaticConversationPost { get; set; }
        public string StaticConversationPostType { get; set; }
        public string StaticConversationPostValue { get; set; }
        public string LogoAddress { get; set; }
    }

    public class TopicModel
    {
        public long Id { get; set; }
        public DateTime InsDate { get; set; }
        public long GeneralStatusId { get; set; }
        public string Caption { get; set; }
    }


    public class TicketSubmitRequest
    {
        public long TopicId { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public List<IFormFile> Files { get; set; }
    }

    public class TicketSubmitResponse
    {
        public long Status { get; set; }
        public long TicketId { get; set; }
        public string[] Files { get; set; }
    }

    public class TicketDetailSubmitResponse
    {
        public long Status { get; set; }
        public long TicketDetailId { get; set; }
        public string[] Files { get; set; }
    }


}
