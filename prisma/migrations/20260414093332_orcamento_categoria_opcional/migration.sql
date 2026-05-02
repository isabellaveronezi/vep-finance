-- DropForeignKey
ALTER TABLE "orcamentos" DROP CONSTRAINT "orcamentos_categoriaId_fkey";

-- AlterTable
ALTER TABLE "orcamentos" ALTER COLUMN "categoriaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
