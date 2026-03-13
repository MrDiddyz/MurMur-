import { PrismaClient } from "@prisma/client";

let prismaSingleton: PrismaClient | null = null;

export const getPrisma = (): PrismaClient => {
  if (!prismaSingleton) {
    prismaSingleton = new PrismaClient();
  }
  return prismaSingleton;
};
