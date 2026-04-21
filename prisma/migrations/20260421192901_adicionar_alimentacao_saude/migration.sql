-- CreateTable
CREATE TABLE "Alimentacao" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "unidade" TEXT NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "animalId" INTEGER NOT NULL,

    CONSTRAINT "Alimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saude" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tratamento" TEXT,
    "medicamento" TEXT,
    "dose" TEXT,
    "observacoes" TEXT,
    "resolvido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "animalId" INTEGER NOT NULL,

    CONSTRAINT "Saude_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Alimentacao" ADD CONSTRAINT "Alimentacao_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saude" ADD CONSTRAINT "Saude_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
