import express from "express"
import prisma from "../config/prisma.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const router = express.Router()

console.log("JWT_SECRET:", process.env.JWT_SECRET ? "OK" : "NÃO ENCONTRADO")

router.post("/register", async (req, res) => {
  try {
    const { email, senha, nome } = req.body
    if (!email || !senha || !nome) {
      return res.status(400).json({ erro: "Nome, email e senha são obrigatórios" })
    }
    const usuarioExistente = await prisma.user.findUnique({
      where: { email },
    })
    if (usuarioExistente) {
      return res.status(400).json({ erro: "Usuário já existe" })
    }
    const senhaHash = await bcrypt.hash(senha, 10)
    const usuario = await prisma.user.create({
      data: { nome, email, senha: senhaHash },
    })
    res.json(usuario)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: err.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body
    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha obrigatórios" })
    }
    const usuario = await prisma.user.findUnique({
      where: { email },
    })
    if (!usuario) {
      return res.status(400).json({ erro: "Usuário não encontrado" })
    }
    const senhaValida = await bcrypt.compare(senha, usuario.senha)
    if (!senhaValida) {
      return res.status(400).json({ erro: "Senha inválida" })
    }
    const token = jwt.sign(
      { userId: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )
    res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: err.message })
  }
})

export default router