-- AlterTable
ALTER TABLE "Animal" ADD COLUMN     "categoria" TEXT,
ADD COLUMN     "gaiola" TEXT,
ADD COLUMN     "peso" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Cobertura" (
    "id" SERIAL NOT NULL,
    "matrizId" INTEGER NOT NULL,
    "machoId" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "observacao" TEXT,

    CONSTRAINT "Cobertura_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cobertura" ADD CONSTRAINT "Cobertura_matrizId_fkey" FOREIGN KEY ("matrizId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobertura" ADD CONSTRAINT "Cobertura_machoId_fkey" FOREIGN KEY ("machoId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
