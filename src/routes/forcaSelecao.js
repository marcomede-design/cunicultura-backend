import express from "express"
import prisma from "../config/prisma.js"
import { autenticar } from "../middleware/auth.js"

const router = express.Router()

router.get("/", autenticar, async (req, res) => {
  try {
    const animais = await prisma.animal.findMany({
      where: { userId: req.userId, sexo: "F" },
      include: {
        reproducoesComomMatrix: {
          include: { ninhada: { include: { mortalidades: true } } }
        },
        registrosSaude: true
      }
    })

    const ranking = animais.map(animal => {
      const reproducoes = animal.reproducoesComomMatrix
      const totalCoberturas = reproducoes.length
      const totalPartos = reproducoes.filter(r => r.dataParto).length
      const totalPrenhas = reproducoes.filter(r => r.confirmadaPrenhez).length

      const percPrenhez = totalCoberturas > 0 ? (totalPrenhas / totalCoberturas) * 100 : 0
      const percSucesso = totalPrenhas > 0 ? (totalPartos / totalPrenhas) * 100 : 0

      const ninhadas = reproducoes.filter(r => r.ninhada).map(r => r.ninhada)
      const mediaNNV = ninhadas.length > 0
        ? ninhadas.reduce((acc, n) => acc + n.nascidosVivos, 0) / ninhadas.length
        : 0

      const totalMortes = ninhadas.reduce((acc, n) =>
        acc + n.mortalidades.reduce((a, m) => a + m.quantidade, 0), 0)
      const totalVivos = ninhadas.reduce((acc, n) => acc + n.nascidosVivos, 0)
      const percMortalidade = totalVivos > 0 ? (totalMortes / totalVivos) * 100 : 0

      const ocorrenciasSaude = animal.registrosSaude.length
      const rusticidade = Math.max(0, 100 - (ocorrenciasSaude * 10))

      const forcaSelecao = (
        (percPrenhez * 0.25) +
        (percSucesso * 0.25) +
        (mediaNNV * 5) +
        (Math.max(0, 100 - percMortalidade) * 0.25) +
        (rusticidade * 0.25)
      ).toFixed(1)

      return {
        id: animal.id,
        nome: animal.nome,
        raca: animal.raca,
        totalPartos,
        totalCoberturas,
        percPrenhez: percPrenhez.toFixed(1),
        percSucesso: percSucesso.toFixed(1),
        mediaNNV: mediaNNV.toFixed(1),
        percMortalidade: percMortalidade.toFixed(1),
        rusticidade: rusticidade.toFixed(1),
        forcaSelecao: parseFloat(forcaSelecao),
        adequada: parseFloat(forcaSelecao) >= 100
      }
    })

    ranking.sort((a, b) => b.forcaSelecao - a.forcaSelecao)

    res.json(ranking)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

export default router