
import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

async function iniciarServidor() {
  try {
    await client.connect();

    const db = client.db("bookshelf");

    console.log("MongoDB conectado com sucesso!");

    app.get("/", (req, res) => {
      res.json({ mensagem: "API Bookshelf funcionando!" });
    });

    app.get("/api/usuarios", async (req, res) => {
      try {
        const usuarios = await db
          .collection("usuarios")
          .find({})
          .toArray();

        res.json(usuarios);
      } catch (erro) {
        res.status(500).json({
          erro: "Erro ao buscar usuários."
        });
      }
    });

    app.get("/api/metricas", async (req, res) => {
      try {
        const metricas = await db
          .collection("metricas")
          .find({})
          .toArray();

        res.json(metricas);
      } catch (erro) {
        res.status(500).json({
          erro: "Erro ao buscar métricas."
        });
      }
    });

    app.get("/api/publicacao", async (req, res) => {
      try {
        const publicacoes = await db
          .collection("publicacao")
          .find({})
          .toArray();

        res.json(publicacoes);
      } catch (erro) {
        res.status(500).json({
          erro: "Erro ao buscar publicações."
        });
      }
    });

    app.listen(PORT, () => {
      console.log(`API rodando em http://localhost:${PORT}`);
    });
  } catch (erro) {
    console.error("Erro ao conectar ao MongoDB:", erro.message);
    process.exit(1);
  }
}

iniciarServidor();
