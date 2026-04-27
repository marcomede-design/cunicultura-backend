import express from "express"
import { PrismaClient } from "@prisma/client"
import { autenticar } from "../middleware/auth.js"

const router = express.Router()
const prisma = new PrismaClient()

async function buscarPais(animalId, geracoes = 2) {
  if (geracoes === 0) return null

  const reproducao = await prisma.reproducao.findFirst({
    where: { ninhada: { reproducaoId: { not: null } }, matrizId: animalId },
    include: {
      matriz: true,
      reprodutor: true,
      ninhada: true
    },
    orderBy: { dataCobertura: "desc" }
  })

  const comoFilhote = await prisma.reproducao.findFirst({
    where: {
      dataParto: { not: null },
      ninhada: { is: { reproducaoId: { not: null } } }
    },
    include: {
      matriz: true,
      reprodutor: true
    }
  })

  return { mae: reproducao?.matriz || null, pai: reproducao?.reprodutor || null }
}

router.get("/:id", autenticar, async (req, res) => {
  try {
    const animalId = parseInt(req.params.id)

    const animal = await prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        reproducoesComomMatrix: {
          include: { reprodutor: true, ninhada: true },
          orderBy: { dataCobertura: "desc" },
          take: 1
        }
      }
    })

    if (!animal) return res.status(404).json({ erro: "Animal nao encontrado" })

    const ultimaReproducao = animal.reproducoesComomMatrix[0]
    const pai = ultimaReproducao?.reprodutor || null

    const maePai = pai ? await prisma.reproducao.findFirst({
      where: { matrizId: pai.id },
      include: { matriz: true, reprodutor: true },
      orderBy: { dataCobertura: "desc" }
    }) : null

    const genealogia = {
      animal,
      mae: null,
      pai,
      avosMaternos: null,
      avosPat: maePai ? { avo: maePai.matriz, avoPai: maePai.reprodutor } : null
    }

    res.json(genealogia)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.get("/filhotes/:id", autenticar, async (req, res) => {
  try {
    const animalId = parseInt(req.params.id)

    const reproducoes = await prisma.reproducao.findMany({
      where: {
        OR: [
          { matrizId: animalId },
          { reproducaoId: animalId }
        ],
        dataParto: { not: null }
      },
      include: {
        matriz: true,
        reprodutor: true,
        ninhada: true
      },
      orderBy: { dataParto: "desc" }
    })

    res.json(reproducoes)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

export default router