-- CreateTable
CREATE TABLE "Ninhada" (
    "id" SERIAL NOT NULL,
    "matrizId" INTEGER NOT NULL,
    "dataParto" TIMESTAMP(3) NOT NULL,
    "nascidos" INTEGER NOT NULL,
    "mortos" INTEGER NOT NULL,
    "desmamados" INTEGER,
    "observacao" TEXT,

    CONSTRAINT "Ninhada_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ninhada" ADD CONSTRAINT "Ninhada_matrizId_fkey" FOREIGN KEY ("matrizId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
