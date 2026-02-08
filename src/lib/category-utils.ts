import { PREDEFINED_CATEGORIES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function getAllCategoriesForUser(userId: string) {
  const customCategories = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return {
    predefined: [...PREDEFINED_CATEGORIES],
    custom: customCategories,
    allNames: new Set([
      ...PREDEFINED_CATEGORIES.map((name) => name.toLowerCase()),
      ...customCategories.map((category) => category.name.toLowerCase()),
    ]),
  };
}

export function normalizeCategoryName(name: string) {
  return name.trim();
}
