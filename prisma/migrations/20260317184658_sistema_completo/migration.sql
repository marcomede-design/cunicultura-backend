/*
  Warnings:

  - You are about to drop the column `data` on the `Cobertura` table. All the data in the column will be lost.
  - Added the required column `dataCobertura` to the `Cobertura` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previsaoParto` to the `Cobertura` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cobertura" DROP COLUMN "data",
ADD COLUMN     "dataCobertura" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "previsaoParto" TIMESTAMP(3) NOT NULL;
