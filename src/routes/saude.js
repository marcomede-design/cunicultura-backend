import express from "express"
import { PrismaClient } from "@prisma/client"
import { autenticar } from "../middleware/auth.js"

const router = express.Router()
const prisma = new PrismaClient()

router.post("/", autenticar, async (req, res) => {
  const { animalId, tipo, descricao, tratamento, medicamento, dose, observacoes, data } = req.body
  try {
    const saude = await prisma.saude.create({
      data: {
        animalId: parseInt(animalId),
        tipo,
        descricao,
        tratamento,
        medicamento,
        dose,
        observacoes,
        data: data ? new Date(data) : new Date()
      }
    })
    res.status(201).json(saude)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.get("/:animalId", autenticar, async (req, res) => {
  try {
    const registros = await prisma.saude.findMany({
      where: { animalId: parseInt(req.params.animalId) },
      orderBy: { data: "desc" }
    })
    res.json(registros)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.patch("/:id/resolver", autenticar, async (req, res) => {
  try {
    const saude = await prisma.saude.update({
      where: { id: parseInt(req.params.id) },
      data: { resolvido: true }
    })
    res.json(saude)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

export default router