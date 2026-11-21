namespace MeraatWebApplication.Data.Models.School
{
    public class SchoolReceiptPayment
    {
        public long Id { get; set; }
        public string ShamsiInsertDate { get; set; }
        public long CenterId { get; set; }
        public long SectionId { get; set; }
        public string TypeId { get; set; }
        public string TypeCaption { get; set; }
        public long StateCode { get; set; }
        public string StateName { get; set; }
        public string CityCode { get; set; }
        public string CityName { get; set; }
        public string CenterName { get; set; }
        public long PaymentTypeId { get; set; } //170 Cash | 171 Check || 10071 online
        public long PaymentStatusId { get; set; } // 10072 WaitForConfirm | 10073 RejectedPayment | 10074 ConfirmedPayment
        public string PaymentTypeCaption { get; set; } //درگاه پرداخت | پرداخت با فیش نقدی | پرداخت با چک
        public string PaymentStatusCaption { get; set; } // منتظر تایید مالی | پرداخت رد شده | پرداخت تایید شده
        public string BankName { get; set; } // ملی،​ملت ...
        public string FullName { get; set; } // پرداخت کننده
        public string AccountNo { get; set; } //   واریز شده به کدام حساب مرآت فقط برای نقدی - یا شناسه ملی -کارت ملت: 6104-3375-6169-8182
        public string PaymentDate { get; set; } // تاریخ واریز یا سررسید
        public string DocNo { get; set; } // شماره فیش یا شماره صیادی چک
        public long PaymentAmount { get; set; } // مبلغ فیش کارت به کارت یا چک
        public string[] ReceiptImages { get; set; }
        public string PaymentReceiptAddress { get; set; } // تصویر سند
    }
}
