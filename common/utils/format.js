export const formatCurrency = (n) => {
  if (n == null) return "";
  return new Intl.NumberFormat("fa-IR").format(Number(n)) + " تومان";
};
