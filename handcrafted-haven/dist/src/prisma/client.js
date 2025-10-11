// src/prisma/client.ts
import { PrismaClient } from "@prisma/client";
var prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production")
    global.prisma = prisma;
export default prisma;
