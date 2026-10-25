
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

		// CRUD DE USUARIO
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

		app.post("/api/usuarios", async (req, res) => {
			try {
				const novoUsuario = req.body;

				const resultado = await db
					.collection("usuarios")
					.insertOne(novoUsuario);

				res.status(201).json({
					mensagem: "Usuário cadastrado com sucesso!",
					id: resultado.insertedId
				});
			} catch (erro) {
				console.error(erro);
				res.status(500).json({ erro: "Erro ao cadastrar usuário." });
			}
		});

		app.get("/api/usuarios/:id", async (req, res) => {
			try {
				const id = Number(req.params.id);

				const usuario = await db
					.collection("usuarios")
					.findOne({ _id: id });

				if (!usuario) {
					return res.status(404).json({
						erro: "Usuário não encontrado."
					});
				}

				res.json(usuario);
			} catch (erro) {
				res.status(500).json({ erro: "Erro ao buscar usuário." });
			}
		});

		app.put("/api/usuarios/:id", async (req, res) => {
			try {
				const id = Number(req.params.id);
				const dados = { ...req.body };

				delete dados._id;

				const resultado = await db
					.collection("usuarios")
					.updateOne(
						{ _id: id },
						{ $set: dados }
					);

				if (resultado.matchedCount === 0) {
					return res.status(404).json({
						erro: "Usuário não encontrado."
					});
				}

				res.json({ mensagem: "Usuário atualizado com sucesso!" });
			} catch (erro) {
				res.status(500).json({ erro: "Erro ao atualizar usuário." });
			}
		});

		app.delete("/api/usuarios/:id", async (req, res) => {
			try {
				const id = Number(req.params.id);

				const resultado = await db
					.collection("usuarios")
					.deleteOne({ _id: id });

				if (resultado.deletedCount === 0) {
					return res.status(404).json({
						erro: "Usuário não encontrado."
					});
				}

				res.json({ mensagem: "Usuário excluído com sucesso!" });
			} catch (erro) {
				res.status(500).json({ erro: "Erro ao excluir usuário." });
			}
		});



		// CRUD DE MÉTRICAS
		app.get("/api/metricas", async (req, res) => {
			try {
				const metricas = await db
					.collection("metricas")
					.find({})
					.toArray();

				res.json(metricas);
			} catch (erro) {
				console.error(erro);
				res.status(500).json({ erro: "Erro ao buscar métricas." });
			}
		});

		app.get("/api/metricas/:id", async (req, res) => {
			try {
				const id = Number(req.params.id);

				const metrica = await db
					.collection("metricas")
					.findOne({ _id: id });

				if (!metrica) {
					return res.status(404).json({ erro: "Métrica não encontrada." });
				}

				res.json(metrica);
			} catch (erro) {
				console.error(erro);
				res.status(500).json({ erro: "Erro ao buscar métrica." });
			}
		});

		app.post("/api/metricas", async (req, res) => {
			try {
				const resultado = await db
					.collection("metricas")
					.insertOne(req.body);

				res.status(201).json({
					mensagem: "Métrica cadastrada com sucesso!",
					id: resultado.insertedId
				});
			} catch (erro) {
				console.error(erro);
				res.status(500).json({ erro: "Erro ao cadastrar métrica." });
			}
		});

		app.put("/api/metricas/:id", async (req, res) => {
			try {
				const id = Number(req.params.id);
				const dados = { ...req.body };
				delete dados._id;

				const resultado = await db
					.collection("metricas")
					.updateOne({ _id: id }, { $set: dados });

				if (resultado.matchedCount === 0) {
					return res.status(404).json({ erro: "Métrica não encontrada." });
				}

				res.json({ mensagem: "Métrica atualizada com sucesso!" });
			} catch (erro) {
				console.error(erro);
				res.status(500).json({ erro: "Erro ao atualizar métrica." });
			}
		});

		app.delete("/api/metricas/:id", async (req, res) => {
			try {
				const id = Number(req.params.id);

				const resultado = await db
					.collection("metricas")
					.deleteOne({ _id: id });

				if (resultado.deletedCount === 0) {
					return res.status(404).json({ erro: "Métrica não encontrada." });
				}

				res.json({ mensagem: "Métrica excluída com sucesso!" });
			} catch (erro) {
				console.error(erro);
				res.status(500).json({ erro: "Erro ao excluir métrica." });
			}
		});

		// CRUD DE PUBLICACAO
		app.get("/api/publicacao", async (req, res) => {
			try {
				const publicacoes = await db
					.collection("publicacao")
					.find({})
					.toArray();

				res.json(publicacoes);
			} catch (erro) {
				console.error(erro);
				res.status(500).json({ erro: "Erro ao buscar publicações." });
			}
		});

		app.get("/api/publicacao/:id", async (req, res) => {
			try {
				const id = Number(req.params.id);

				const publicacao = await db
					.collection("publicacao")
					.findOne({ _id: id });

				if (!publicacao) {
					return res.status(404).json({
						erro: "Publicação não encontrada."
					});
				}

				res.json(publicacao);
			} catch (erro) {
				console.error(erro);
				res.status(500).json({ erro: "Erro ao buscar publicação." });
			}
		});

		app.post("/api/publicacao", async (req, res) => {
			try {
				const resultado = await db
					.collection("publicacao")
					.insertOne(req.body);

				res.status(201).json({
					mensagem: "Publicação cadastrada com sucesso!",
					id: resultado.insertedId
				});
			} catch (erro) {
				console.error(erro);
				res.status(500).json({ erro: "Erro ao cadastrar publicação." });
			}
		});

		app.put("/api/publicacao/:id", async (req, res) => {
			try {
				const id = Number(req.params.id);
				const dados = { ...req.body };
				delete dados._id;

				const resultado = await db
					.collection("publicacao")
					.updateOne({ _id: id }, { $set: dados });

				if (resultado.matchedCount === 0) {
					return res.status(404).json({
						erro: "Publicação não encontrada."
					});
				}

				res.json({ mensagem: "Publicação atualizada com sucesso!" });
			} catch (erro) {
				console.error(erro);
				res.status(500).json({ erro: "Erro ao atualizar publicação." });
			}
		});

		app.delete("/api/publicacao/:id", async (req, res) => {
			try {
				const id = Number(req.params.id);

				const resultado = await db
					.collection("publicacao")
					.deleteOne({ _id: id });

				if (resultado.deletedCount === 0) {
					return res.status(404).json({
						erro: "Publicação não encontrada."
					});
				}

				res.json({ mensagem: "Publicação excluída com sucesso!" });
			} catch (erro) {
				console.error(erro);
				res.status(500).json({ erro: "Erro ao excluir publicação." });
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
