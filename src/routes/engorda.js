import express from "express"
import { PrismaClient } from "@prisma/client"
import { autenticar } from "../middleware/auth.js"

const router = express.Router()
const prisma = new PrismaClient()

router.post("/lotes", autenticar, async (req, res) => {
  const { nome, descricao, dataInicio, qtdAnimais } = req.body
  try {
    const lote = await prisma.loteEngorda.create({
      data: { nome, descricao, dataInicio: new Date(dataInicio), userId: req.userId }
    })
    if (qtdAnimais) {
      await prisma.pesagem.create({
        data: { loteId: lote.id, data: new Date(dataInicio), pesoTotal: 0, qtdAnimais: parseInt(qtdAnimais), pesoMedio: 0, observacoes: "Entrada do lote" }
      })
    }
    res.status(201).json(lote)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.get("/lotes", autenticar, async (req, res) => {
  try {
    const lotes = await prisma.loteEngorda.findMany({
      where: { userId: req.userId },
      include: {
        pesagens: { orderBy: { data: "asc" } },
        consumos: true
      },
      orderBy: { createdAt: "desc" }
    })

    const lotesComCalculo = lotes.map(lote => {
      const pesagens = lote.pesagens
      const consumos = lote.consumos

      const pesagensValidas = pesagens.filter(p => p.pesoTotal > 0)
      const pesoInicial = pesagensValidas.length > 0 ? pesagensValidas[0].pesoTotal : 0
      const pesoFinal = pesagensValidas.length > 0 ? pesagensValidas[pesagensValidas.length - 1].pesoTotal : 0
      const ganho = pesoFinal - pesoInicial

      const totalConsumo = consumos.reduce((acc, c) => acc + c.quantidade, 0)
      const conversaoAlimentar = ganho > 0 ? (totalConsumo / ganho).toFixed(2) : null

      const consumoPorTipo = {}
      const consumoPorMarca = {}
      consumos.forEach(c => {
        consumoPorTipo[c.tipo] = (consumoPorTipo[c.tipo] || 0) + c.quantidade
        if (c.marca) consumoPorMarca[c.marca] = (consumoPorMarca[c.marca] || 0) + c.quantidade
      })

      return {
        ...lote,
        pesoInicial,
        pesoFinal,
        ganho: ganho.toFixed(2),
        totalConsumo: totalConsumo.toFixed(2),
        conversaoAlimentar,
        consumoPorTipo,
        consumoPorMarca,
        qtdAnimais: pesagens.length > 0 ? pesagens[pesagens.length - 1].qtdAnimais : 0
      }
    })

    res.json(lotesComCalculo)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.patch("/lotes/:id/encerrar", autenticar, async (req, res) => {
  try {
    const lote = await prisma.loteEngorda.update({
      where: { id: parseInt(req.params.id) },
      data: { ativo: false, dataFim: new Date() }
    })
    res.json(lote)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.post("/lotes/:id/pesagens", autenticar, async (req, res) => {
  const { data, pesoTotal, qtdAnimais, observacoes } = req.body
  const pesoMedio = pesoTotal / qtdAnimais
  try {
    const pesagem = await prisma.pesagem.create({
      data: {
        loteId: parseInt(req.params.id),
        data: new Date(data),
        pesoTotal: parseFloat(pesoTotal),
        qtdAnimais: parseInt(qtdAnimais),
        pesoMedio: parseFloat(pesoMedio.toFixed(2)),
        observacoes
      }
    })
    res.status(201).json(pesagem)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.post("/lotes/:id/consumos", autenticar, async (req, res) => {
  const { data, tipo, marca, quantidade, unidade, observacoes } = req.body
  try {
    const consumo = await prisma.consumoAlimento.create({
      data: {
        loteId: parseInt(req.params.id),
        data: new Date(data),
        tipo,
        marca,
        quantidade: parseFloat(quantidade),
        unidade: unidade || "kg",
        observacoes
      }
    })
    res.status(201).json(consumo)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.get("/lotes/:id", autenticar, async (req, res) => {
  try {
    const lote = await prisma.loteEngorda.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        pesagens: { orderBy: { data: "asc" } },
        consumos: { orderBy: { data: "desc" } }
      }
    })
    res.json(lote)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

export default router