import { PrismaClient } from "@prisma/client/extension";


const prismaClientSingleton = () =>{
    return new PrismaClient();
}

type prismaClientSingleton = ReturnType<typeof prismaClientSingleton>;
// This is a workaround to avoid creating multiple PrismaClient instances in development mode

const globalForPrisma = globalThis as unknown as {prisma: PrismaClient | undefined};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if(process.env.NODE_ENV !== "production")  globalForPrisma.prisma = prisma;

export default prisma;

