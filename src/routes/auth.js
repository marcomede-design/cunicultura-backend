import express from "express"
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

export default router