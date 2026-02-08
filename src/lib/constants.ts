export const AUTH_COOKIE_NAME = "sft_token";

export const PREDEFINED_CATEGORIES = [
  "Food",
  "Transport",
  "Education",
  "Entertainment",
  "Bills",
  "Others",
] as const;

export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const;

export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "IDR",
  "JPY",
  "SGD",
  "AUD",
] as const;

export const SUPPORTED_LANGUAGES = ["EN", "ID"] as const;

export const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const PUBLIC_ROUTES = ["/login", "/register"];

export const PUBLIC_API_ROUTES = ["/api/auth/login", "/api/auth/register"];
