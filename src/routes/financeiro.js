import express from "express"
import { PrismaClient } from "@prisma/client"
import { autenticar } from "../middleware/auth.js"

const router = express.Router()
const prisma = new PrismaClient()

router.post("/", autenticar, async (req, res) => {
  const { data, tipo, categoria, descricao, valor, observacoes } = req.body
  try {
    const lancamento = await prisma.lancamentoFinanceiro.create({
      data: {
        data: new Date(data),
        tipo,
        categoria,
        descricao,
        valor: parseFloat(valor),
        observacoes,
        userId: req.userId
      }
    })
    res.status(201).json(lancamento)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.get("/", autenticar, async (req, res) => {
  const { mes, ano } = req.query
  try {
    const where = { userId: req.userId }
    if (mes && ano) {
      const inicio = new Date(parseInt(ano), parseInt(mes) - 1, 1)
      const fim = new Date(parseInt(ano), parseInt(mes), 0, 23, 59, 59)
      where.data = { gte: inicio, lte: fim }
    }

    const lancamentos = await prisma.lancamentoFinanceiro.findMany({
      where,
      orderBy: { data: "desc" }
    })

    const totalReceitas = lancamentos.filter(l => l.tipo === "receita").reduce((acc, l) => acc + l.valor, 0)
    const totalCustos = lancamentos.filter(l => l.tipo === "custo").reduce((acc, l) => acc + l.valor, 0)
    const lucro = totalReceitas - totalCustos

    const porCategoria = {}
    lancamentos.forEach(l => {
      if (!porCategoria[l.categoria]) porCategoria[l.categoria] = { total: 0, tipo: l.tipo }
      porCategoria[l.categoria].total += l.valor
    })

    res.json({ lancamentos, totalReceitas, totalCustos, lucro, porCategoria })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.delete("/:id", autenticar, async (req, res) => {
  try {
    await prisma.lancamentoFinanceiro.delete({
      where: { id: parseInt(req.params.id) }
    })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

export default router