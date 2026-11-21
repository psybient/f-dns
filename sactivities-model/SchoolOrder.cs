
using Amazon.S3.Model;
using MeraatWebApplication.Data.Models.Services;
using System.Collections.Generic;

namespace MeraatWebApplication.Data.Models.School
{
    public class SchoolOrderDraft
    {
        public int ActiveYear { get; set; }
        public long CenterId { get; set; }
        public long SectionId { get; set; }
        public string CenterName { get; set; }
        public long GradeFieldId { get; set; }
        public string GradeFieldCaption { get; set; }
        public int TestPersonCount { get; set; }
        public int ProductType { get; set; }
        public string ProductCaption { get; set; }
        public long ExamId { get; set; }
        public long TestNo { get; set; }
        public bool HasBeenPlaced { get; set; }
        public bool HasBeenPurchased { get; set; }
        public bool HasBeenCompletelyPaid { get; set; }
        public bool HasPaidValue { get; set; }
        public bool IsBridgeScience { get; set; }
        public bool ExamTypeId { get; set; }
        public bool PrintIt { get; set; }
        public int Fee { get; set; }
        public long Amount { get; set; }
        public int Discount { get; set; }
        public long NetPrice { get; set; }
        public bool IsTimeToOrderOver { get; set; }
        public string ToolTip { get; set; }
        public string DiscountDescription { get; set; }
        public bool CanOrderOnlineAfterLock { get; set; }
    }
    public class SchoolOrder
    {
        public int ActiveYear { get; set; }
        public long CenterId { get; set; }
        public long SectionId { get; set; }
        public string CenterName { get; set; }
        public IEnumerable<GradeFieldBox> GradeFieldBoxes { get; set; }
        public InvoiceSummary InvoiceSummary { get; set; }
        public BaseFee BaseFee { get; set; }
        public IEnumerable<SpecialDiscountModel> SpecialDiscountModel { get; set; }
    }
    public class GradeFieldBox
    {
        public long GradeFieldId { get; set; }
        public string GradeFieldCaption { get; set; }
        public int TestPersonCount { get; set; }
        public Product Quizzes { get; set; }
        public Product LearningAssessment { get; set; }
        public Product TestMaker { get; set; }
        public Product DescriptivePackage { get; set; }

    }
    public class Product
    {
        public IEnumerable<ProductItem> ProductItems { get; set; }
        public ProductFinancialGroup ProductFinancialGroup { get; set; }
    }
    public class ProductItem
    {
        public string ProductCaption { get; set; }
        public long ExamId { get; set; }
        public long TestNo { get; set; }
        public bool HasBeenPlaced { get; set; }
        public bool HasBeenPurchased { get; set; }
        public bool HasBeenCompletelyPaid { get; set; }
        public bool HasPaidValue { get; set; }
        public bool IsBridgeScience { get; set; }
        public bool ExamTypeId { get; set; }
        public bool PrintIt { get; set; }
        public bool IsTimeToOrderOver { get; set; }
        public string ToolTip { get; set; }
        public int ProductType { get; set; }
        public bool CanOrderOnlineAfterLock { get; set; }
    }

    public class ProductFinancialGroup
    {
        public int Fee { get; set; }
        public long Amount { get; set; }
        public decimal Discount { get; set; }
        public string DiscountDescription { get; set; }
        public long NetPrice { get; set; }

        //Static product price
        public int ProductType { get; set; }
        public int OnlineQuizFee { get; set; }
        public int QuizFee { get; set; }
        public int TestMakerFee { get; set; }
        public int LearningAssessmentFee { get; set; }
        public int DescriptiveFee { get; set; }
    }

    public class BaseFee
    {
        public int OnlineQuizFee { get; set; }
        public int QuizFee { get; set; }
        public int TestMakerFee { get; set; }
        public int LearningAssessmentFee { get; set; }
        public int DescriptiveFee { get; set; }
    }

    public class InvoiceSummary
    {
        public long NetPriceSum { get; set; }
        public long RemainingBalance { get; set; }
        public long AmountPaid { get; set; }
    }

    public class SpecialDiscountModel
    {
        public long DiscountModelId { get; set; } //Unique Id
        public int SFB { get; set; }
        public long GradeFieldId { get; set; }
        public int SuggestedDiscount { get; set; } // 50%
        public bool HasCenterSpecialDiscount { get; set; } // true|false
        public bool HasStudentSpecialDiscount { get; set; } // true|false
        public string ShortPackageName { get; set; } // "بسته کامل دانش آموز"|"بسته کامل مدرسه"
        public string SpecialDiscountDescription { get; set; } // "هردانش آموز|1,700,000|تومان"
        public string SpecialDiscountDeadlineDescription { get; set; } // "تسویه تا 15 مهر"
        public bool HasBeenPurchased { get; set; }
        public int DiscountType { get; set; }
        public bool Availability { get; set; }
    }
    public class SpecialDiscountModelList
    {
        public int TestNo { get; set; }
    }


    public class ParticipantsBox
    {
        public OrderInfo OrderInfo { get; set; }
        public IEnumerable<ParticipantsBoxStudents> Participants { get; set; }
    }
    public class OrderInfo
    {
        public long ExamId { get; set; }
        public long TestNo { get; set; }
        public string TestCaption { get; set; }
        public long GradeFieldId { get; set; }
        public string GradeFieldCaption { get; set; }
        public string ExamDate { get; set; }
        public string LockDate { get; set; }
        public string TestPersonCount { get; set; }
        public string ParticipantsCount { get; set; }
        public bool IsBridgeScience { get; set; }
        public bool PrintIt { get; set; }
        public bool ExamTypeId { get; set; }
        public bool IsTimeToOrderOver { get; set; }
        public string ToolTip { get; set; }
		public bool AfterLockEditable { get; set; }
        public bool HasBeenPurchased { get; set; }
        public bool Has50Percent { get; set; }
        public bool CanOrderOnlineAfterLock { get; set; }

    }
	public class ParticipantsBoxStudents
    {
        public long TestPersonId { get; set; }
        public int RowNo { get; set; }
        public string StudentName { get; set; }
        public bool IsPresent { get; set; }
        public bool Disabled { get; set; }
        public int ClassNo { get; set; }
	}



    public class StudentPaymentMakingDraft
    {
        public long GradeFieldId { get; set; }
        public string GradeFieldCaption { get; set; }
        public long RowNo { get; set; } //TempNo
        public long TestPersonId { get; set; }
        public string StudentName { get; set; }
        public string ProductCaption { get; set; }
        public long ExamId { get; set; }
        public long TestNo { get; set; }
        public bool RequestToPay { get; set; }
        public bool HasBeenPaid { get; set; }
        public bool IsBridgeScience { get; set; }
        public int ProductType { get; set; }
        public bool HasAnOrder { get; set; }
        public string ToolTip { get; set; }
        public int ProductPrice { get; set; }
        public int PaidByCenter { get; set; }

    }
    public class SecondStudentPaymentMakingDraft
    {
        public long GradeFieldId { get; set; }
        public string GradeFieldCaption { get; set; }
        public long RowNo { get; set; } 
        public long TestPersonId { get; set; }
        public string StudentName { get; set; }
        public long Amount { get; set; }
        public long RemainingBalance { get; set; }
    }

    public class StudentPaymentMaking
    {
        public IEnumerable<GradeFieldColumn> GradeFieldColumns;
        public StudentPaymentSummary StudentPaymentSummary;
    }
    public class GradeFieldColumn
    {
        public long GradeFieldId { get; set; }
        public string GradeFieldCaption { get; set; }
        public IEnumerable<OrderSetting> OrderSettings { get; set; }
    }
    public class OrderSetting
    {
        public long RowNo { get; set; }
        public long TestPersonId { get; set; }
        public string StudentName { get; set; }
        public IEnumerable<ProductToAssign> ProductToAssign { get; set; }
        public long Amount { get; set; }
        public long RemainingBalance { get; set; }
    }

    public class ProductToAssign
    {
        public string ProductCaption { get; set; }
        public long ExamId { get; set; }
        public long TestNo { get; set; }
        public bool RequestToPay { get; set; }
        public bool HasBeenPaid { get; set; }
        public bool IsBridgeScience { get; set; }
        public int PaidByCenter { get; set; }
        public int ProductType { get; set; }
        public bool HasAnOrder { get; set; }
        public string ToolTip { get; set; }
        public int ProductPrice { get; set; }
    }

    public class StudentPaymentSummary
    {
        public long AllRequestToPay { get; set; }
        public long AmountPaid { get; set; }
    }


    public class StudentPaymentSettingStatus
    {
        public long ExamId { get; set; }
        public bool RequestToPay { get; set; }
    }
    public class StudentPaymentSettingData
    {
        public long TestPersonId { get; set; }
        public List<StudentPaymentSettingStatus> Status { get; set; }
    }
    public class StudentPaymentSetting
    {
        public long GradeFieldId { get; set; }
        public List<StudentPaymentSettingData> Data { get; set; }
    }
    
	public class SchoolInvoiceDraft
	{

        // Agency ----------------------------------------
        public int? CenterId { get; set; }
        public string? CenterName { get; set; }
        public string? SectionCode { get; set; }
        public string? Section { get; set; }
        public string? ManagerName { get; set; }
        public string? Managercellphone { get; set; }
        public string? SchoolAddress { get; set; }
        public string? SchoolZip { get; set; }
        public string? SchoolTel { get; set; }
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public int? TestGroup { get; set; }
        public string? StateName { get; set; }
        public string? CityName { get; set; }
        public string? SchoolKarpoosheLink { get; set; }
        public IEnumerable<ExamDelivaryTypes>? ExamDelivaryList { get; set; }
        // Agency ----------------------------------------

        public int ProductType { get; set; }
		public long ExamId { get; set; }
		public long ExamType { get; set; }
		public bool Tehran { get; set; }
		public long PersonRoleId { get; set; }
		public long ButtonMessage { get; set; }
		public long AmountToPay { get; set; }
		public string ConfirmationMessage { get; set; }
		public bool IsStudentListEnable { get; set; }
		public string StatusCaption { get; set; }
		public int StatusId { get; set; }
		public string TimeToPay { get; set; }
		public long NetPrice { get; set; }
		public int Discount { get; set; }
		public string StudentCount { get; set; }
		public string Fee { get; set; }
		public string Caption { get; set; }
		public int RowNo { get; set; }
		public long WalletBalance { get; set; }
		public int FilledNamesCount { get; set; }
		public int GradeFieldId { get; set; }
		public bool InfoVerification { get; set; }
		public int CreatedStd { get; set; }
		public bool LockStatus { get; set; }
		public bool AfterLockEditable { get; set; }
        public int TestNo { get; set; }
        public bool NameFillingStatus { get; set; }
        public string GeneralStatus { get; set; }
        public bool HasCreditFund { get; set; }
        
    }
    

	public class SchoolInvoice
    {
        //public int WalletBalance { get; set; }
        public IEnumerable<SchoolInvoiceRecord>  SchoolInvoiceRecord { get; set; }
    }
    public class SchoolInvoiceRecord
    {
        public int RowNo { get; set; }
        public string Caption { get; set; }
        public string Fee { get; set; }
        public string StudentCount { get; set; }
        public int Discount { get; set; }
        public long NetPrice { get; set; }
        public string TimeToPay { get; set; }
        public int StatusId { get; set; }
        public string StatusCaption { get; set; }
        public bool IsStudentListEnable { get; set; }
        public long AmountToPay { get; set; }
        public long ExamType { get; set; }
        public bool Tehran { get; set; }
        public string ConfirmationMessage { get; set; }
        public int FilledNamesCount { get; set; }
        public int GradeFieldId { get; set; }
        public int ProductType { get; set; }
        public long ExamId { get; set; }
        public bool InfoVerification { get; set; }
        public int CreatedStd { get; set; }
		public bool LockStatus { get; set; }
		public bool AfterLockEditable { get; set; }
        public int TestNo { get; set; }
        public bool NameFillingStatus { get; set; }
        public string GeneralStatus { get; set; }
        public bool HasCreditFund { get; set; }
    }


    public class ContractStatus
    {
        public string GradeFieldCaption { get; set; }
        public long GradeFieldId { get; set; }
        public bool Status { get; set; }
        public int StudentWithName { get; set; }
        public bool HasTestMaker { get; set; }
    }



    public class StudentRecordsChagneResult
    {
        public int StudentCount { get; set; }
        public string Message { get; set; }
    }


    public class SchoolWalletInfo
    {
        public long Row { get; set; }
        public string Title { get; set; }
        public string Caption { get; set; }
        public string Description { get; set; }
        public long Amount { get; set; }
        public string PayDate { get; set; }
        public int InputOutput { get; set; }
        public bool IsStudentPayment { get; set; }
        public string GradeFieldCaption { get; set; }
        public long GradeFieldId { get; set; }
        public string FilterName { get; set; }
    }


    public class SchoolBankRequest
    {
        public long RequestId { get; set; }
        public long PersonId { get; set; }
        public long Price { get; set; }
        public long UserId { get; set; }
    }

    public class StudentPaymentTrack
    {
        public int Row { get; set; }
        public int TempNo { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public bool HasBeenPurchased { get; set; }
    }


    public class WalletBalance
    {
        public long Amount { get; set; }
        public long AgencyDebt { get; set; }
    }


    public class ExamSchedule
    {
        public string ActiveYear { get; set; }
        public long ExamId { get; set; }
        public string Caption { get; set; }
        public string SecondCaption { get; set; }
        public string ExamDate { get; set; }
        public long GradeFieldId { get; set; }
        public string GradeFieldCaption { get; set; }
    }

}
