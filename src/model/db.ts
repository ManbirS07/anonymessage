import { PrismaClient } from "@/src/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export default prisma;  
//we can re-use this instance -> this instance gets cached when we first export the module
//one global instance of PrismaClient is used across the entire application, which is more efficient and prevents issues related to multiple instances trying to connect to the database simultaneously.
// Prisma Client uses a connection pool of database connections

//if we create multiple instance of prisma client inside multiple api routes,
//each instance will create its own connection pool, which can lead to too many connections being opened to the database
//by using a single instance, we ensure there is only 1 connection pool, out of which connections are efficiently managed and reused across the entire application, preventing connection exhaustion and improving performance.