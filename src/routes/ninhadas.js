import express from "express"
import { PrismaClient } from "@prisma/client"
import { autenticar } from "../middleware/auth.js"

const router = express.Router()
const prisma = new PrismaClient()

// Atualizar dados da ninhada (peso, sexagem)
router.patch("/:id", autenticar, async (req, res) => {
  const { machos, femeas, pesoMedioNascer, pesoMedioDesmame, vivosAtual } = req.body
  try {
    const ninhada = await prisma.ninhada.update({
      where: { id: parseInt(req.params.id) },
      data: { machos, femeas, pesoMedioNascer, pesoMedioDesmame, vivosAtual }
    })
    res.json(ninhada)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Registrar mortalidade durante lactação
router.post("/:id/mortalidade", autenticar, async (req, res) => {
  const { quantidade, causa } = req.body
  const ninhadaId = parseInt(req.params.id)

  try {
    const mortalidade = await prisma.mortalidade.create({
      data: {
        ninhadaId,
        quantidade,
        causa,
        data: new Date()
      }
    })

    // Atualiza vivosAtual automaticamente
    const ninhada = await prisma.ninhada.findUnique({ where: { id: ninhadaId } })
    const totalMortes = await prisma.mortalidade.aggregate({
      where: { ninhadaId },
      _sum: { quantidade: true }
    })

    const vivosAtual = ninhada.nascidosVivos - (totalMortes._sum.quantidade || 0)
    await prisma.ninhada.update({
      where: { id: ninhadaId },
      data: { vivosAtual }
    })

    res.status(201).json({ mortalidade, vivosAtual })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Listar mortalidades de uma ninhada
router.get("/:id/mortalidade", autenticar, async (req, res) => {
  try {
    const mortalidades = await prisma.mortalidade.findMany({
      where: { ninhadaId: parseInt(req.params.id) },
      orderBy: { data: "desc" }
    })
    res.json(mortalidades)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Listar todas as ninhadas com resumo
router.get("/", autenticar, async (req, res) => {
  try {
    const ninhadas = await prisma.ninhada.findMany({
      include: {
        reproducao: {
          include: { matriz: true }
        },
        mortalidades: true
      },
      orderBy: { createdAt: "desc" }
    })

    const comResumo = ninhadas.map(n => {
      const totalMortes = n.mortalidades.reduce((acc, m) => acc + m.quantidade, 0)
      const taxaMortalidade = n.nascidosVivos > 0
        ? ((totalMortes / n.nascidosVivos) * 100).toFixed(1)
        : 0

      return {
        ...n,
        totalMortes,
        taxaMortalidade: `${taxaMortalidade}%`,
        vivosAtual: n.vivosAtual ?? n.nascidosVivos - totalMortes
      }
    })

    res.json(comResumo)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

export default router