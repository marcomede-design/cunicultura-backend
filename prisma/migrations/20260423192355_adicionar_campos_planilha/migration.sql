-- AlterTable
ALTER TABLE "Animal" ADD COLUMN     "historico" TEXT,
ADD COLUMN     "pesoMonta" DOUBLE PRECISION,
ADD COLUMN     "raca" TEXT;

-- AlterTable
ALTER TABLE "Reproducao" ADD COLUMN     "diagGestacao" TEXT,
ADD COLUMN     "tipoCobracao" TEXT;
