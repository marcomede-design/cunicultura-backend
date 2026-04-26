import express from "express"
import prisma from "../config/prisma.js"
import { autenticar } from "../middleware/auth.js"
const router = express.Router()

router.post("/", autenticar, async (req, res) => {
  try {
    const { nome, sexo, historico, raca, pelagem, castrado, pesoAtual, dataNascimento, veterinario, pesoMonta } = req.body
    const animal = await prisma.animal.create({
      data: {
        nome, sexo, historico, raca, pelagem,
        castrado: castrado !== undefined ? Boolean(castrado) : null,
        pesoAtual: pesoAtual ? parseFloat(pesoAtual) : null,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        veterinario,
        pesoMonta: pesoMonta ? parseFloat(pesoMonta) : null,
        userId: req.userId
      }
    })
    res.json(animal)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.get("/", autenticar, async (req, res) => {
  try {
    const animais = await prisma.animal.findMany({
      where: { userId: req.userId },
      orderBy: { nome: "asc" }
    })
    res.json(animais)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.get("/:id", autenticar, async (req, res) => {
  try {
    const animal = await prisma.animal.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        registrosSaude: { orderBy: { data: "desc" } },
        alimentacoes: { orderBy: { data: "desc" }, take: 10 },
        reproducoesComomMatrix: {
          include: { ninhada: true },
          orderBy: { dataCobertura: "desc" }
        }
      }
    })
    res.json(animal)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.put("/:id", autenticar, async (req, res) => {
  try {
    const { nome, sexo, historico, raca, pelagem, castrado, pesoAtual, dataNascimento, veterinario, pesoMonta } = req.body
    const animal = await prisma.animal.update({
      where: { id: Number(req.params.id) },
      data: {
        nome, sexo, historico, raca, pelagem,
        castrado: castrado !== undefined ? Boolean(castrado) : null,
        pesoAtual: pesoAtual ? parseFloat(pesoAtual) : null,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        veterinario,
        pesoMonta: pesoMonta ? parseFloat(pesoMonta) : null
      }
    })
    res.json(animal)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.delete("/:id", autenticar, async (req, res) => {
  try {
    await prisma.animal.delete({
      where: { id: Number(req.params.id) }
    })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

export default router