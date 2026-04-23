-- CreateTable
CREATE TABLE "LoteEngorda" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "LoteEngorda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pesagem" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "pesoTotal" DOUBLE PRECISION NOT NULL,
    "qtdAnimais" INTEGER NOT NULL,
    "pesoMedio" DOUBLE PRECISION NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loteId" INTEGER NOT NULL,

    CONSTRAINT "Pesagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsumoAlimento" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "marca" TEXT,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "unidade" TEXT NOT NULL DEFAULT 'kg',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loteId" INTEGER NOT NULL,

    CONSTRAINT "ConsumoAlimento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LoteEngorda" ADD CONSTRAINT "LoteEngorda_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pesagem" ADD CONSTRAINT "Pesagem_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "LoteEngorda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoAlimento" ADD CONSTRAINT "ConsumoAlimento_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "LoteEngorda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
