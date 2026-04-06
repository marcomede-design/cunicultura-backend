import express from "express"
import prisma from "../config/prisma.js"
import { autenticar } from "../middleware/auth.js"

const router = express.Router()

// CRIAR
router.post("/", autenticar, async (req, res) => {
  try {
    const { nome, sexo } = req.body

    const animal = await prisma.animal.create({
      data: { nome, sexo, userId: req.userId }
    })

    res.json(animal)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: "Erro ao criar animal" })
  }
})

// LISTAR
router.get("/", autenticar, async (req, res) => {
  try {
    const animais = await prisma.animal.findMany({
      where: { userId: req.userId }
    })
    res.json(animais)
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar" })
  }
})

// EXCLUIR
router.delete("/:id", autenticar, async (req, res) => {
  try {
    await prisma.animal.delete({
      where: { id: Number(req.params.id) }
    })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ erro: "Erro ao excluir" })
  }
})

// EDITAR
router.put("/:id", autenticar, async (req, res) => {
  try {
    const { nome, sexo } = req.body

    const animal = await prisma.animal.update({
      where: { id: Number(req.params.id) },
      data: { nome, sexo }
    })

    res.json(animal)
  } catch (err) {
    res.status(500).json({ erro: "Erro ao editar" })
  }
})

export default router