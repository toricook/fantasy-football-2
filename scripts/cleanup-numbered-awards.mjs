import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
await prisma.award.deleteMany({
  where: {
    name: {
      contains: "#"
    }
  }
});
console.log("Deleted numbered awards");