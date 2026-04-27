const fs = require('fs')

const authAtualizado = `import express from "express"
import prisma from "../config/prisma.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { autenticar } from "../middleware/auth.js"

const router = express.Router()

router.post("/register", async (req, res) => {
  try {
    const { email, senha, nome, nomeGranja } = req.body
    if (!email || !senha || !nome) {
      return res.status(400).json({ erro: "Nome, email e senha sao obrigatorios" })
    }
    const usuarioExistente = await prisma.user.findUnique({ where: { email } })
    if (usuarioExistente) {
      return res.status(400).json({ erro: "Usuario ja existe" })
    }
    const senhaHash = await bcrypt.hash(senha, 10)
    const usuario = await prisma.user.create({
      data: { nome, email, senha: senhaHash, nomeGranja: nomeGranja || null }
    })
    res.json(usuario)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body
    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha obrigatorios" })
    }
    const usuario = await prisma.user.findUnique({ where: { email } })
    if (!usuario) {
      return res.status(400).json({ erro: "Usuario nao encontrado" })
    }
    const senhaValida = await bcrypt.compare(senha, usuario.senha)
    if (!senhaValida) {
      return res.status(400).json({ erro: "Senha invalida" })
    }
    const token = jwt.sign(
      { userId: usuario.id },
      process.env.JWT_SECRET || "cunicultura_granja_2025_secret",
      { expiresIn: "30d" }
    )
    res.json({ token })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.get("/me", autenticar, async (req, res) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, nome: true, email: true, nomeGranja: true, createdAt: true }
    })
    res.json(usuario)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.put("/me", autenticar, async (req, res) => {
  try {
    const { nome, nomeGranja } = req.body
    const usuario = await prisma.user.update({
      where: { id: req.userId },
      data: { nome, nomeGranja },
      select: { id: true, nome: true, email: true, nomeGranja: true }
    })
    res.json(usuario)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

export default router`

const genealogia = `import express from "express"
import { PrismaClient } from "@prisma/client"
import { autenticar } from "../middleware/auth.js"

const router = express.Router()
const prisma = new PrismaClient()

async function buscarPais(animalId, geracoes = 2) {
  if (geracoes === 0) return null

  const reproducao = await prisma.reproducao.findFirst({
    where: { ninhada: { reproducaoId: { not: null } }, matrizId: animalId },
    include: {
      matriz: true,
      reprodutor: true,
      ninhada: true
    },
    orderBy: { dataCobertura: "desc" }
  })

  const comoFilhote = await prisma.reproducao.findFirst({
    where: {
      dataParto: { not: null },
      ninhada: { is: { reproducaoId: { not: null } } }
    },
    include: {
      matriz: true,
      reprodutor: true
    }
  })

  return { mae: reproducao?.matriz || null, pai: reproducao?.reprodutor || null }
}

router.get("/:id", autenticar, async (req, res) => {
  try {
    const animalId = parseInt(req.params.id)

    const animal = await prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        reproducoesComomMatrix: {
          include: { reprodutor: true, ninhada: true },
          orderBy: { dataCobertura: "desc" },
          take: 1
        }
      }
    })

    if (!animal) return res.status(404).json({ erro: "Animal nao encontrado" })

    const ultimaReproducao = animal.reproducoesComomMatrix[0]
    const pai = ultimaReproducao?.reprodutor || null

    const maePai = pai ? await prisma.reproducao.findFirst({
      where: { matrizId: pai.id },
      include: { matriz: true, reprodutor: true },
      orderBy: { dataCobertura: "desc" }
    }) : null

    const genealogia = {
      animal,
      mae: null,
      pai,
      avosMaternos: null,
      avosPat: maePai ? { avo: maePai.matriz, avoPai: maePai.reprodutor } : null
    }

    res.json(genealogia)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.get("/filhotes/:id", autenticar, async (req, res) => {
  try {
    const animalId = parseInt(req.params.id)

    const reproducoes = await prisma.reproducao.findMany({
      where: {
        OR: [
          { matrizId: animalId },
          { reproducaoId: animalId }
        ],
        dataParto: { not: null }
      },
      include: {
        matriz: true,
        reprodutor: true,
        ninhada: true
      },
      orderBy: { dataParto: "desc" }
    })

    res.json(reproducoes)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

export default router`

fs.writeFileSync('src/routes/auth.js', authAtualizado, 'utf8')
fs.writeFileSync('src/routes/genealogia.js', genealogia, 'utf8')
console.log('auth.js atualizado e genealogia.js criado!')