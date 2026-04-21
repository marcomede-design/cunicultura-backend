import express from "express"
import { PrismaClient } from "@prisma/client"
import { autenticar } from "../middleware/auth.js"

const router = express.Router()
const prisma = new PrismaClient()

router.post("/", autenticar, async (req, res) => {
  const { animalId, tipo, quantidade, unidade, observacoes, data } = req.body
  try {
    const alimentacao = await prisma.alimentacao.create({
      data: {
        animalId: parseInt(animalId),
        tipo,
        quantidade: parseFloat(quantidade),
        unidade,
        observacoes,
        data: data ? new Date(data) : new Date()
      }
    })
    res.status(201).json(alimentacao)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.get("/:animalId", autenticar, async (req, res) => {
  try {
    const alimentacoes = await prisma.alimentacao.findMany({
      where: { animalId: parseInt(req.params.animalId) },
      orderBy: { data: "desc" }
    })
    res.json(alimentacoes)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

export default router