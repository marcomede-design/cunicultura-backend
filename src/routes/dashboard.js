import express from "express"
import { PrismaClient } from "@prisma/client"
import { autenticar } from "../middleware/auth.js"

const router = express.Router()
const prisma = new PrismaClient()

router.get("/", autenticar, async (req, res) => {
  try {
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    const totalAnimais = await prisma.animal.count({ where: { userId: req.userId } })
    const totalFemeas = await prisma.animal.count({ where: { userId: req.userId, sexo: "F" } })
    const totalMachos = await prisma.animal.count({ where: { userId: req.userId, sexo: "M" } })

    const partosMes = await prisma.reproducao.count({
      where: { dataParto: { gte: inicioMes } }
    })

    const ninhadasMes = await prisma.ninhada.findMany({
      where: { createdAt: { gte: inicioMes } }
    })

    const mediaFilhotes = ninhadasMes.length > 0
      ? (ninhadasMes.reduce((acc, n) => acc + n.nascidosVivos, 0) / ninhadasMes.length).toFixed(1)
      : 0

    const todasNinhadas = await prisma.ninhada.findMany({
      include: { mortalidades: true }
    })

    const totalVivos = todasNinhadas.reduce((acc, n) => acc + n.nascidosVivos, 0)
    const totalMortes = todasNinhadas.reduce((acc, n) =>
      acc + n.mortalidades.reduce((a, m) => a + m.quantidade, 0), 0)
    const taxaMortalidade = totalVivos > 0
      ? ((totalMortes / totalVivos) * 100).toFixed(1)
      : 0

    const reproducoes = await prisma.reproducao.findMany({
      where: { dataParto: null },
      include: { matriz: true, ninhada: true }
    })

    const alertas = []
    reproducoes.forEach(r => {
      if (!r.confirmadaPrenhez && r.dataConfirmacaoPrenhez) {
        const dias = Math.ceil((new Date(r.dataConfirmacaoPrenhez) - hoje) / (1000 * 60 * 60 * 24))
        if (dias <= 2) alertas.push({
          tipo: dias < 0 ? "danger" : "warning",
          mensagem: `Matriz ${r.matriz.nome} — confirmar prenhez`,
          detalhe: dias < 0 ? `Atrasado ${Math.abs(dias)} dia(s)` : `Prazo: ${dias === 0 ? "hoje" : `em ${dias} dia(s)`}`
        })
      }
      if (r.confirmadaPrenhez) {
        const partoPrevisto = new Date(r.dataCobertura)
        partoPrevisto.setDate(partoPrevisto.getDate() + 31)
        const dias = Math.ceil((partoPrevisto - hoje) / (1000 * 60 * 60 * 24))
        if (dias <= 3) alertas.push({
          tipo: dias < 0 ? "danger" : "warning",
          mensagem: `Matriz ${r.matriz.nome} — parto ${dias < 0 ? "atrasado" : "previsto"}`,
          detalhe: dias < 0 ? `Previsto há ${Math.abs(dias)} dia(s)` : `Em ${dias} dia(s)`
        })
      }
      if (r.ninhada?.dataDesmame) {
        const dias = Math.ceil((new Date(r.ninhada.dataDesmame) - hoje) / (1000 * 60 * 60 * 24))
        if (dias <= 3 && dias >= 0) alertas.push({
          tipo: "info",
          mensagem: `Ninhada — desmame em ${dias} dia(s)`,
          detalhe: `${r.ninhada.vivosAtual ?? r.ninhada.nascidosVivos} filhotes vivos`
        })
      }
    })

    res.json({
      animais: { total: totalAnimais, femeas: totalFemeas, machos: totalMachos },
      reproducao: { partosMes, mediaFilhotes: parseFloat(mediaFilhotes) },
      mortalidade: { taxaMortalidade: parseFloat(taxaMortalidade) },
      alertas
    })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

export default router