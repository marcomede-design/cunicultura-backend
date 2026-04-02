import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js"; // 👈 IMPORTANTE

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 REGISTRAR ROTAS
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API rodando...");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});