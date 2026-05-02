-- CreateEnum
CREATE TYPE "StatusDividaPropria" AS ENUM ('ABERTA', 'QUITADA');

-- AlterTable
ALTER TABLE "transacoes" ADD COLUMN     "dividaPropiaId" TEXT;

-- CreateTable
CREATE TABLE "dividas_proprias" (
    "id" TEXT NOT NULL,
    "credor" TEXT NOT NULL,
    "descricao" TEXT,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "parcelas" INTEGER,
    "vencimento" TIMESTAMP(3),
    "status" "StatusDividaPropria" NOT NULL DEFAULT 'ABERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "dividas_proprias_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_dividaPropiaId_fkey" FOREIGN KEY ("dividaPropiaId") REFERENCES "dividas_proprias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dividas_proprias" ADD CONSTRAINT "dividas_proprias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
