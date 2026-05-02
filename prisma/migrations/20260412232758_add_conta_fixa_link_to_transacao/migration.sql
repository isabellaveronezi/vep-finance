-- AlterTable
ALTER TABLE "transacoes" ADD COLUMN     "contaFixaId" TEXT;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_contaFixaId_fkey" FOREIGN KEY ("contaFixaId") REFERENCES "contas_fixas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
