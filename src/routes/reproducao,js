import express from "express"
import { PrismaClient } from "@prisma/client"
import { autenticar } from "../middleware/auth.js"

const router = express.Router()
const prisma = new PrismaClient()

// Registrar cobertura
router.post("/", autenticar, async (req, res) => {
  const { matrizId, reproducaoId, dataCobertura, observacoes } = req.body

  const dataC = new Date(dataCobertura)
  const dataConfirmacaoPrenhez = new Date(dataC)
  dataConfirmacaoPrenhez.setDate(dataC.getDate() + 14)

  const dataPartoPrevisto = new Date(dataC)
  dataPartoPrevisto.setDate(dataC.getDate() + 31)

  try {
    const reproducao = await prisma.reproducao.create({
      data: {
        matrizId,
        reproducaoId,
        dataCobertura: dataC,
        dataConfirmacaoPrenhez,
        observacoes
      }
    })
    res.status(201).json({
      ...reproducao,
      dataPartoPrevisto,
      dataDesmamePrevista: new Date(dataPartoPrevisto.getTime() + 35 * 24 * 60 * 60 * 1000)
    })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Confirmar prenhez
router.patch("/:id/confirmar-prenhez", autenticar, async (req, res) => {
  try {
    const reproducao = await prisma.reproducao.update({
      where: { id: parseInt(req.params.id) },
      data: { confirmadaPrenhez: true }
    })
    res.json(reproducao)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Registrar parto
router.patch("/:id/parto", autenticar, async (req, res) => {
  const { totalNascidos, nascidosVivos, nascidosMortos } = req.body
  const dataParto = new Date()
  const dataDesmame = new Date()
  dataDesmame.setDate(dataParto.getDate() + 35)

  try {
    const reproducao = await prisma.reproducao.update({
      where: { id: parseInt(req.params.id) },
      data: { dataParto, dataDesmame }
    })

    const ninhada = await prisma.ninhada.create({
      data: {
        reproducaoId: reproducao.id,
        totalNascidos,
        nascidosVivos,
        nascidosMortos
      }
    })

    res.json({ reproducao, ninhada })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

// Listar todas com alertas
router.get("/", autenticar, async (req, res) => {
  try {
    const reproducoes = await prisma.reproducao.findMany({
      include: { matriz: true, ninhada: true }
    })

    const hoje = new Date()

    const comAlertas = reproducoes.map(r => {
      const alertas = []

      if (!r.confirmadaPrenhez && r.dataConfirmacaoPrenhez) {
        const dias = Math.ceil((new Date(r.dataConfirmacaoPrenhez) - hoje) / (1000 * 60 * 60 * 24))
        if (dias <= 2 && dias >= 0) alertas.push(`⚠️ Confirmar prenhez em ${dias} dia(s)`)
        if (dias < 0) alertas.push(`🚨 Confirmação de prenhez atrasada ${Math.abs(dias)} dia(s)`)
      }

      if (r.confirmadaPrenhez && !r.dataParto) {
        const partoPrevisto = new Date(r.dataCobertura)
        partoPrevisto.setDate(partoPrevisto.getDate() + 31)
        const dias = Math.ceil((partoPrevisto - hoje) / (1000 * 60 * 60 * 24))
        if (dias <= 3 && dias >= 0) alertas.push(`🐇 Parto previsto em ${dias} dia(s)`)
        if (dias < 0) alertas.push(`🚨 Parto atrasado ${Math.abs(dias)} dia(s)`)
      }

      if (r.dataDesmame) {
        const dias = Math.ceil((new Date(r.dataDesmame) - hoje) / (1000 * 60 * 60 * 24))
        if (dias <= 3 && dias >= 0) alertas.push(`🍼 Desmame em ${dias} dia(s)`)
      }

      return { ...r, alertas }
    })

    res.json(comAlertas)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

export default router