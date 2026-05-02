-- AlterTable
ALTER TABLE "dividas_terceiros" ADD COLUMN     "cartaoId" TEXT,
ADD COLUMN     "formaPagamento" "FormaPagamento";

-- AddForeignKey
ALTER TABLE "dividas_terceiros" ADD CONSTRAINT "dividas_terceiros_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "cartoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
