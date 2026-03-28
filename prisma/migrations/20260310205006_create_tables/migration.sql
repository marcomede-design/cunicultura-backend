-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" SERIAL NOT NULL,
    "brinco" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "raca" TEXT NOT NULL,
    "nascimento" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matriz" (
    "id" SERIAL NOT NULL,
    "animalId" INTEGER NOT NULL,
    "totalPartos" INTEGER NOT NULL DEFAULT 0,
    "totalFilhotes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Matriz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Animal_brinco_key" ON "Animal"("brinco");

-- CreateIndex
CREATE UNIQUE INDEX "Matriz_animalId_key" ON "Matriz"("animalId");

-- AddForeignKey
ALTER TABLE "Matriz" ADD CONSTRAINT "Matriz_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
