import { z } from "zod";
import { SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES, TRANSACTION_TYPES } from "@/lib/constants";

const parseNumber = (value: unknown) => {
  if (typeof value === "string") {
    return Number(value);
  }
  return value;
};

export const registerSchema = z.object({
  username: z.string().trim().min(2, "Username must be at least 2 characters").max(40),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const transactionSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
  amount: z.preprocess(parseNumber, z.number().positive("Amount must be more than 0")),
  category: z.string().trim().min(1, "Category is required").max(40, "Category is too long"),
  type: z.enum(TRANSACTION_TYPES),
  date: z
    .string()
    .trim()
    .min(1, "Date is required")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Date is invalid"),
  notes: z.string().trim().max(250, "Notes are too long").optional().or(z.literal("")),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required").max(40, "Category name is too long"),
});

export const savingsGoalSchema = z.object({
  title: z.string().trim().min(2, "Goal title is required").max(80, "Goal title is too long"),
  targetAmount: z.preprocess(
    parseNumber,
    z.number().positive("Target amount must be more than 0"),
  ),
  savedAmount: z.preprocess(parseNumber, z.number().min(0, "Saved amount cannot be negative")),
  targetDate: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), "Target date is invalid"),
});

export const profileSettingsSchema = z.object({
  username: z.string().trim().min(2).max(40),
  currency: z.enum(SUPPORTED_CURRENCIES),
  language: z.enum(SUPPORTED_LANGUAGES),
  darkMode: z.boolean(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
});
