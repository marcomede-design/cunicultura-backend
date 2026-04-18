/*
  Warnings:

  - You are about to drop the column `brinco` on the `Animal` table. All the data in the column will be lost.
  - You are about to drop the column `categoria` on the `Animal` table. All the data in the column will be lost.
  - You are about to drop the column `gaiola` on the `Animal` table. All the data in the column will be lost.
  - You are about to drop the column `nascimento` on the `Animal` table. All the data in the column will be lost.
  - You are about to drop the column `peso` on the `Animal` table. All the data in the column will be lost.
  - You are about to drop the column `raca` on the `Animal` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Animal` table. All the data in the column will be lost.
  - You are about to drop the column `dataParto` on the `Ninhada` table. All the data in the column will be lost.
  - You are about to drop the column `desmamados` on the `Ninhada` table. All the data in the column will be lost.
  - You are about to drop the column `matrizId` on the `Ninhada` table. All the data in the column will be lost.
  - You are about to drop the column `mortos` on the `Ninhada` table. All the data in the column will be lost.
  - You are about to drop the column `nascidos` on the `Ninhada` table. All the data in the column will be lost.
  - You are about to drop the column `observacao` on the `Ninhada` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Cobertura` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Matriz` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[reproducaoId]` on the table `Ninhada` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nome` to the `Animal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Animal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nascidosMortos` to the `Ninhada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nascidosVivos` to the `Ninhada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reproducaoId` to the `Ninhada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalNascidos` to the `Ninhada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senha` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cobertura" DROP CONSTRAINT "Cobertura_machoId_fkey";

-- DropForeignKey
ALTER TABLE "Cobertura" DROP CONSTRAINT "Cobertura_matrizId_fkey";

-- DropForeignKey
ALTER TABLE "Matriz" DROP CONSTRAINT "Matriz_animalId_fkey";

-- DropForeignKey
ALTER TABLE "Ninhada" DROP CONSTRAINT "Ninhada_matrizId_fkey";

-- DropIndex
DROP INDEX "Animal_brinco_key";

-- AlterTable
ALTER TABLE "Animal" DROP COLUMN "brinco",
DROP COLUMN "categoria",
DROP COLUMN "gaiola",
DROP COLUMN "nascimento",
DROP COLUMN "peso",
DROP COLUMN "raca",
DROP COLUMN "status",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Ninhada" DROP COLUMN "dataParto",
DROP COLUMN "desmamados",
DROP COLUMN "matrizId",
DROP COLUMN "mortos",
DROP COLUMN "nascidos",
DROP COLUMN "observacao",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nascidosMortos" INTEGER NOT NULL,
ADD COLUMN     "nascidosVivos" INTEGER NOT NULL,
ADD COLUMN     "reproducaoId" INTEGER NOT NULL,
ADD COLUMN     "totalNascidos" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "senha" TEXT NOT NULL;

-- DropTable
DROP TABLE "Cobertura";

-- DropTable
DROP TABLE "Matriz";

-- CreateTable
CREATE TABLE "Reproducao" (
    "id" SERIAL NOT NULL,
    "dataCobertura" TIMESTAMP(3) NOT NULL,
    "dataConfirmacaoPrenhez" TIMESTAMP(3),
    "confirmadaPrenhez" BOOLEAN NOT NULL DEFAULT false,
    "dataParto" TIMESTAMP(3),
    "dataDesmame" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matrizId" INTEGER NOT NULL,
    "reproducaoId" INTEGER,

    CONSTRAINT "Reproducao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ninhada_reproducaoId_key" ON "Ninhada"("reproducaoId");

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reproducao" ADD CONSTRAINT "Reproducao_matrizId_fkey" FOREIGN KEY ("matrizId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reproducao" ADD CONSTRAINT "Reproducao_reproducaoId_fkey" FOREIGN KEY ("reproducaoId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ninhada" ADD CONSTRAINT "Ninhada_reproducaoId_fkey" FOREIGN KEY ("reproducaoId") REFERENCES "Reproducao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
