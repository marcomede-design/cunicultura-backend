import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();

// 🔥 CONEXÃO COM SSL (RENDER)
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const prisma = new PrismaClient({ adapter });

// 🔥 RECONEXÃO AUTOMÁTICA
async function conectarBanco() {
  try {
    await prisma.$connect();
    console.log("✅ Banco conectado");
  } catch (err) {
    console.error("❌ Erro ao conectar, tentando novamente...", err);
    setTimeout(conectarBanco, 5000);
  }
}

conectarBanco();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

/* ================= ANIMAIS ================= */

app.get("/animais", async (req, res) => {
  try {
    const animais = await prisma.animal.findMany({
      orderBy: { id: "desc" }
    });
    res.json(animais);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar animais" });
  }
});

app.post("/animais", async (req, res) => {
  try {
    const { brinco, sexo, raca, nascimento, status = "ativo" } = req.body;

    const dataNascimento = new Date(nascimento);

    if (isNaN(dataNascimento)) {
      return res.status(400).json({ erro: "Data inválida" });
    }

    const animal = await prisma.animal.create({
      data: {
        brinco,
        sexo,
        raca,
        nascimento: dataNascimento,
        status
      }
    });

    res.json(animal);

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: error.message });
  }
});

/* ================= DELETE ANIMAL ================= */

app.delete("/animais/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [cobertura, ninhada] = await Promise.all([
      prisma.cobertura.findFirst({
        where: {
          OR: [{ matrizId: id }, { machoId: id }]
        }
      }),
      prisma.ninhada.findFirst({
        where: { matrizId: id }
      })
    ]);

    if (cobertura || ninhada) {
      return res.status(400).json({
        erro: "Animal possui histórico reprodutivo"
      });
    }

    await prisma.animal.delete({
      where: { id }
    });

    res.json({ mensagem: "Excluído com sucesso" });

  } catch (error) {

    console.error("ERRO DELETE:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ erro: "Animal não encontrado" });
    }

    res.status(500).json({ erro: "Erro ao excluir animal" });
  }
});

/* ================= COBERTURAS ================= */

app.post("/coberturas", async (req, res) => {
  try {
    const { matrizId, machoId, dataCobertura } = req.body;

    if (!matrizId || !machoId || !dataCobertura) {
      return res.status(400).json({ erro: "Dados incompletos" });
    }

    const data = new Date(dataCobertura);

    if (isNaN(data)) {
      return res.status(400).json({ erro: "Data inválida" });
    }

    const coberturaAtiva = await prisma.cobertura.findFirst({
      where: {
        matrizId: Number(matrizId),
        previsaoParto: { gte: new Date() }
      }
    });

    if (coberturaAtiva) {
      return res.status(400).json({
        erro: "Matriz já gestante"
      });
    }

    const previsao = new Date(data);
    previsao.setDate(previsao.getDate() + 31);

    const cobertura = await prisma.cobertura.create({
      data: {
        matrizId: Number(matrizId),
        machoId: Number(machoId),
        dataCobertura: data,
        previsaoParto: previsao
      }
    });

    res.json(cobertura);

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao registrar cobertura" });
  }
});

app.get("/coberturas", async (req, res) => {
  try {
    const coberturas = await prisma.cobertura.findMany({
      include: {
        matriz: { select: { brinco: true } },
        macho: { select: { brinco: true } }
      },
      orderBy: { dataCobertura: "desc" }
    });
    res.json(coberturas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar coberturas" });
  }
});

app.delete("/coberturas/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.cobertura.delete({
      where: { id }
    });

    res.json({ mensagem: "Cobertura excluída" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao excluir cobertura" });
  }
});

/* ================= NINHADAS ================= */

app.post("/ninhadas", async (req, res) => {
  try {
    const { matrizId, dataParto, nascidos, mortos, observacao } = req.body;

    if (!matrizId || !dataParto) {
      return res.status(400).json({ erro: "Dados incompletos" });
    }

    const data = new Date(dataParto);

    if (isNaN(data)) {
      return res.status(400).json({ erro: "Data inválida" });
    }

    const ninhada = await prisma.ninhada.create({
      data: {
        matrizId: Number(matrizId),
        dataParto: data,
        nascidos: Number(nascidos || 0),
        mortos: Number(mortos || 0),
        observacao
      }
    });

    res.json(ninhada);

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao registrar parto" });
  }
});

app.delete("/ninhadas/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.ninhada.delete({
      where: { id }
    });

    res.json({ mensagem: "Ninhada excluída" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao excluir ninhada" });
  }
});

/* ================= HISTÓRICO MATRIZ ================= */

app.get("/matriz/:id/historico", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        erro: "ID inválido"
      });
    }

    const matriz = await prisma.animal.findUnique({
      where: { id }
    });

    if (!matriz) {
      return res.status(404).json({ erro: "Matriz não encontrada" });
    }

    const coberturas = await prisma.cobertura.findMany({
      where: { matrizId: id },
      orderBy: { dataCobertura: "desc" }
    });

    const ninhadas = await prisma.ninhada.findMany({
      where: { matrizId: id },
      orderBy: { dataParto: "desc" }
    });

    res.json({
      matriz,
      coberturas,
      ninhadas
    });

  } catch (error) {
    console.error("ERRO HISTÓRICO:", error);
    res.status(500).json({ erro: error.message });
  }
});

/* ================= DASHBOARD ================= */

app.get("/dashboard", async (req, res) => {
  try {
    const totalAnimais = await prisma.animal.count();
    const totalNinhadas = await prisma.ninhada.count();

    const soma = await prisma.ninhada.aggregate({
      _sum: {
        nascidos: true,
        mortos: true
      }
    });

    const nascidos = soma._sum.nascidos || 0;
    const mortos = soma._sum.mortos || 0;

    const taxa = nascidos > 0
      ? ((mortos / nascidos) * 100).toFixed(2)
      : 0;

    res.json({
      totalAnimais,
      totalNinhadas,
      totalNascidos: nascidos,
      totalMortos: mortos,
      taxaMortalidade: taxa
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro no dashboard" });
  }
});

/* ================= SERVIDOR ================= */

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Servidor rodando na porta", PORT);
});