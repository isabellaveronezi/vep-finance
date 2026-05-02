import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const db = new PrismaClient({ adapter })

async function main() {
  const password = await hash('senha123', 12)

  const user = await db.user.upsert({
    where: { email: 'admin@fincontrol.app' },
    update: {},
    create: {
      name: 'Isabella',
      email: 'admin@fincontrol.app',
      password,
    },
  })

  console.log(`✔ Usuário criado: ${user.email}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())


