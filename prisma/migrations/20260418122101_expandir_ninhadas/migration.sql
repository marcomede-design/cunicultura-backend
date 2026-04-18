-- AlterTable
ALTER TABLE "Ninhada" ADD COLUMN     "femeas" INTEGER,
ADD COLUMN     "machos" INTEGER,
ADD COLUMN     "pesoMedioDesmame" DOUBLE PRECISION,
ADD COLUMN     "pesoMedioNascer" DOUBLE PRECISION,
ADD COLUMN     "vivosAtual" INTEGER;

-- CreateTable
CREATE TABLE "Mortalidade" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "causa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ninhadaId" INTEGER NOT NULL,

    CONSTRAINT "Mortalidade_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Mortalidade" ADD CONSTRAINT "Mortalidade_ninhadaId_fkey" FOREIGN KEY ("ninhadaId") REFERENCES "Ninhada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
