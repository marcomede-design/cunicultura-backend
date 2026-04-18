import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import animaisRoutes from "./routes/animais.js"
import reproducaoRoutes from "./routes/reproducao.js"
import ninhadasRoutes from "./routes/ninhadas.js"

const app = express()
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("API rodando OK")
})

app.use("/auth", authRoutes)
app.use("/animais", animaisRoutes)
app.use("/reproducao", reproducaoRoutes)
app.use("/ninhadas", ninhadasRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})