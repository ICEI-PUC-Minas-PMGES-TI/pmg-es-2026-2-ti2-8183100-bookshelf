import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import { autenticarToken } from "./authMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Verifica o token quando disponível, mas permite consultar o Feed
// sem estar logado.
function autenticarTokenOpcional(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		req.usuario = null;
		return next();
	}

	jwt.verify(token, process.env.JWT_SECRET, (erro, usuario) => {
		req.usuario = erro ? null : usuario;
		next();
	});
}

const client = new MongoClient(process.env.MONGODB_URI);

async function iniciarServidor() {
	try {
		await client.connect();

		const db = client.db("bookshelf");

		console.log("MongoDB conectado com sucesso!");

		// ROTA INICIAL
		app.get("/", (req, res) => {
			res.json({ mensagem: "API Bookshelf funcionando!" });
		});

		// LOGIN
		app.post("/api/auth/login", async (req, res) => {
			try {
				const { email, senha } = req.body;

				if (!email || !senha) {
					return res.status(400).json({
						erro: "Informe o e-mail e a senha."
					});
				}

				const usuario = await db
					.collection("usuarios")
					.findOne({ email });

				if (!usuario || usuario.senha !== senha) {
					return res.status(401).json({
						erro: "E-mail ou senha incorretos."
					});
				}

				const token = jwt.sign(
					{ id: usuario._id.toString() },
					process.env.JWT_SECRET,
					{ expiresIn: "1h" }
				);

				return res.status(200).json({
					mensagem: "Login realizado com sucesso!",
					token,
					usuario: {
						id: usuario._id,
						nome: usuario.nome,
						userName: usuario.userName,
						email: usuario.email
					}
				});
			} catch (erro) {
				console.error(erro);

				res.status(500).json({
					erro: "Erro interno ao realizar login."
				});
			}
		});

		// CRUD DE USUÁRIO

		app.get("/api/usuarios", autenticarToken, async (req, res) => {
			try {
				const usuarios = await db
					.collection("usuarios")
					.find({})
					.toArray();

				res.json(usuarios);
			} catch (erro) {
				console.error(erro);
				res.status(500).json({
					erro: "Erro ao buscar usuários."
				});
			}
		});

		app.post("/api/usuarios", async (req, res) => {
			try {
				const {
					nome,
					userName,
					email,
					senha,
					dataNascimento
				} = req.body;

				const usuario = await db
					.collection("usuarios")
					.findOne({ email });

				if (usuario) {
					return res.status(409).json({
						erro: "Este e-mail já está cadastrado."
					});
				}

				const novoUsuario = {
					nome,
					userName,
					email,
					senha,
					dataNascimento,
					dataCadastro: new Date().toISOString().split("T")[0],
					perfil: {
						bio: "",
						foto: ""
					},
					livrosFav: [],
					livrosLerDepois: [],
					livrosLidos: [],
					livrosLendo: [],
					metricas: [],
					sequencia: 0,
					minLidos: 0,
					pagsLidas: 0,
					avaliacoes: {}
				};

				const resultado = await db
					.collection("usuarios")
					.insertOne(novoUsuario);

				res.status(201).json({
					mensagem: "Usuário cadastrado com sucesso!",
					id: resultado.insertedId
				});
			} catch (erro) {
				console.error(erro);
				res.status(500).json({
					erro: "Erro ao cadastrar usuário."
				});
			}
		});

		app.get("/api/usuarios/:id", autenticarToken, async (req, res) => {
			try {
				if (!ObjectId.isValid(req.params.id)) {
					return res.status(400).json({
						erro: "ID do usuário inválido."
					});
				}

				const usuario = await db
					.collection("usuarios")
					.findOne({
						_id: new ObjectId(req.params.id)
					});

				if (!usuario) {
					return res.status(404).json({
						erro: "Usuário não encontrado."
					});
				}

				res.json(usuario);
			} catch (erro) {
				console.error(erro);
				res.status(500).json({
					erro: "Erro ao buscar usuário."
				});
			}
		});

		app.put("/api/usuarios/:id", autenticarToken, async (req, res) => {
			try {
				if (!ObjectId.isValid(req.params.id)) {
					return res.status(400).json({
						erro: "ID do usuário inválido."
					});
				}

				const dados = { ...req.body };
				delete dados._id;

				const resultado = await db
					.collection("usuarios")
					.updateOne(
						{ _id: new ObjectId(req.params.id) },
						{ $set: dados }
					);

				if (resultado.matchedCount === 0) {
					return res.status(404).json({
						erro: "Usuário não encontrado."
					});
				}

				res.json({
					mensagem: "Usuário atualizado com sucesso!"
				});
			} catch (erro) {
				console.error(erro);
				res.status(500).json({
					erro: "Erro ao atualizar usuário."
				});
			}
		});

		app.delete("/api/usuarios/:id", autenticarToken, async (req, res) => {
			try {
				if (!ObjectId.isValid(req.params.id)) {
					return res.status(400).json({
						erro: "ID do usuário inválido."
					});
				}

				const resultado = await db
					.collection("usuarios")
					.deleteOne({
						_id: new ObjectId(req.params.id)
					});

				if (resultado.deletedCount === 0) {
					return res.status(404).json({
						erro: "Usuário não encontrado."
					});
				}

				res.json({
					mensagem: "Usuário excluído com sucesso!"
				});
			} catch (erro) {
				console.error(erro);
				res.status(500).json({
					erro: "Erro ao excluir usuário."
				});
			}
		});

		// CRUD DE MÉTRICAS

		app.get("/api/metricas", autenticarToken, async (req, res) => {
			try {
				const metricas = await db
					.collection("metricas")
					.find({})
					.toArray();

				res.json(metricas);
			} catch (erro) {
				console.error(erro);
				res.status(500).json({
					erro: "Erro ao buscar métricas."
				});
			}
		});

		app.get("/api/metricas/:id", autenticarToken, async (req, res) => {
			try {
				const id = Number(req.params.id);

				const metrica = await db
					.collection("metricas")
					.findOne({ _id: id });

				if (!metrica) {
					return res.status(404).json({
						erro: "Métrica não encontrada."
					});
				}

				res.json(metrica);
			} catch (erro) {
				console.error(erro);
				res.status(500).json({
					erro: "Erro ao buscar métrica."
				});
			}
		});

		app.post("/api/metricas", autenticarToken, async (req, res) => {
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
				res.status(500).json({
					erro: "Erro ao cadastrar métrica."
				});
			}
		});

		app.put("/api/metricas/:id", autenticarToken, async (req, res) => {
			try {
				const id = Number(req.params.id);
				const dados = { ...req.body };
				delete dados._id;

				const resultado = await db
					.collection("metricas")
					.updateOne({ _id: id }, { $set: dados });

				if (resultado.matchedCount === 0) {
					return res.status(404).json({
						erro: "Métrica não encontrada."
					});
				}

				res.json({
					mensagem: "Métrica atualizada com sucesso!"
				});
			} catch (erro) {
				console.error(erro);
				res.status(500).json({
					erro: "Erro ao atualizar métrica."
				});
			}
		});

		app.delete("/api/metricas/:id", autenticarToken, async (req, res) => {
			try {
				const id = Number(req.params.id);

				const resultado = await db
					.collection("metricas")
					.deleteOne({ _id: id });

				if (resultado.deletedCount === 0) {
					return res.status(404).json({
						erro: "Métrica não encontrada."
					});
				}

				res.json({
					mensagem: "Métrica excluída com sucesso!"
				});
			} catch (erro) {
				console.error(erro);
				res.status(500).json({
					erro: "Erro ao excluir métrica."
				});
			}
		});

		// CRUD DE PUBLICAÇÕES
		app.get(
			"/api/publicacao",
			autenticarTokenOpcional,
			async (req, res) => {
				try {
					const publicacoes = await db
						.collection("publicacao")
						.aggregate([
							{
								$lookup: {
									from: "usuarios",
									localField: "usuarioId",
									foreignField: "_id",
									as: "autor"
								}
							},
							{
								$unwind: {
									path: "$autor",
									preserveNullAndEmptyArrays: true
								}
							},
							{
								$sort: {
									dataPublicacao: -1
								}
							},
							{
								$project: {
									tituloLivro: 1,
									livro: 1,
									resenha: 1,
									avaliacao: 1,
									curtidas: 1,
									curtidoPor: 1,
									dataPublicacao: 1,
									usuario: "$autor.nome",
									userName: "$autor.userName"
								}
							}
						])
						.toArray();

					const resultado = publicacoes.map((publicacao) => {
						const curtidoPor = publicacao.curtidoPor || [];

						const curtiu = Boolean(
							req.usuario?.id &&
							curtidoPor.some(
								id =>
									id.toString() ===
									req.usuario.id.toString()
							)
						);

						return {
							...publicacao,
							curtidoPor: undefined,
							curtiu
						};
					});

					res.json(resultado);
				} catch (erro) {
					console.error(erro);
					res.status(500).json({
						erro: "Erro ao buscar publicações."
					});
				}
			}
		);

		app.get("/api/publicacao/:id", autenticarToken, async (req, res) => {
			try {
				if (!ObjectId.isValid(req.params.id)) {
					return res.status(400).json({
						erro: "ID da publicação inválido."
					});
				}

				const publicacao = await db
					.collection("publicacao")
					.findOne({
						_id: new ObjectId(req.params.id)
					});

				if (!publicacao) {
					return res.status(404).json({
						erro: "Publicação não encontrada."
					});
				}

				res.json(publicacao);
			} catch (erro) {
				console.error(erro);
				res.status(500).json({
					erro: "Erro ao buscar publicação."
				});
			}
		});

		app.post("/api/publicacao", autenticarToken, async (req, res) => {
			try {
				const { livro, resenha, avaliacao } = req.body;

				if (
					!livro ||
					typeof livro.id !== "string" ||
					!livro.id.trim() ||
					typeof livro.titulo !== "string" ||
					!livro.titulo.trim() ||
					typeof resenha !== "string" ||
					!resenha.trim() ||
					avaliacao === undefined ||
					avaliacao === null
				) {
					return res.status(400).json({
						erro: "Selecione um livro e preencha a resenha e a avaliação."
					});
				}

				const nota = Number(avaliacao);

				if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
					return res.status(400).json({
						erro: "A avaliação deve estar entre 1 e 5."
					});
				}

				if (!ObjectId.isValid(req.usuario.id)) {
					return res.status(400).json({
						erro: "ID do usuário inválido."
					});
				}

				const usuarioId = new ObjectId(req.usuario.id);

				// Guarda os dados recebidos do livro selecionado no Catálogo.
				const livroSalvo = {
					id: livro.id.trim(),
					titulo: livro.titulo.trim(),
					autores: Array.isArray(livro.autores)
						? livro.autores
						: [],
					capa: typeof livro.capa === "string"
						? livro.capa
						: null,
					ano: livro.ano || null
				};

				const novaPublicacao = {
					usuarioId,
					tituloLivro: livroSalvo.titulo,
					livro: livroSalvo,
					resenha: resenha.trim(),
					avaliacao: nota,
					curtidas: 0,
					curtidoPor: [],
					dataPublicacao: new Date()
				};

				const resultado = await db
					.collection("publicacao")
					.insertOne(novaPublicacao);

				res.status(201).json({
					mensagem: "Publicação cadastrada com sucesso!",
					id: resultado.insertedId
				});

			} catch (erro) {
				console.error("Erro ao cadastrar publicação:", erro);

				res.status(500).json({
					erro: "Erro ao cadastrar publicação."
				});
			}
		});

		// CURTIR E DESCURTIR PUBLICAÇÃO.
		app.post(
			"/api/publicacao/:id/curtir",
			autenticarToken,
			async (req, res) => {
				try {
					const { id } = req.params;

					if (!ObjectId.isValid(id)) {
						return res.status(400).json({
							erro: "ID da publicação inválido."
						});
					}

					if (!ObjectId.isValid(req.usuario.id)) {
						return res.status(400).json({
							erro: "ID do usuário inválido."
						});
					}

					const publicacaoId = new ObjectId(id);
					const usuarioId = new ObjectId(req.usuario.id);

					const colecao = db.collection("publicacao");

					const publicacao = await colecao.findOne({
						_id: publicacaoId
					});

					if (!publicacao) {
						return res.status(404).json({
							erro: "Publicação não encontrada."
						});
					}

					const curtidoPor = publicacao.curtidoPor || [];

					const jaCurtiu = curtidoPor.some(
						id => id.toString() === usuarioId.toString()
					);

					let resultado;

					if (jaCurtiu) {
						resultado = await colecao.updateOne(
							{
								_id: publicacaoId,
								curtidoPor: usuarioId
							},
							[
								{
									$set: {
										curtidoPor: {
											$filter: {
												input: {
													$ifNull: ["$curtidoPor", []]
												},
												as: "usuario",
												cond: {
													$ne: [
														"$$usuario",
														usuarioId
													]
												}
											}
										},
										curtidas: {
											$max: [
												0,
												{
													$subtract: [
														{ $ifNull: ["$curtidas", 0] },
														1
													]
												}
											]
										}
									}
								}
							]
						);
					} else {
						resultado = await colecao.updateOne(
							{
								_id: publicacaoId,
								curtidoPor: { $ne: usuarioId }
							},
							[
								{
									$set: {
										curtidoPor: {
											$setUnion: [
												{
													$ifNull: ["$curtidoPor", []]
												},
												[usuarioId]
											]
										},
										curtidas: {
											$add: [
												{ $ifNull: ["$curtidas", 0] },
												1
											]
										}
									}
								}
							]
						);
					}

					if (resultado.matchedCount === 0) {
						return res.status(409).json({
							erro: "A curtida foi alterada simultaneamente. Atualize o Feed e tente novamente."
						});
					}

					const atualizada = await colecao.findOne({
						_id: publicacaoId
					});

					const listaAtualizada = atualizada.curtidoPor || [];

					const usuarioCurtiu = listaAtualizada.some(
						id => id.toString() === usuarioId.toString()
					);

					res.json({
						mensagem: usuarioCurtiu
							? "Publicação curtida com sucesso!"
							: "Curtida removida com sucesso!",
						curtiu: usuarioCurtiu,
						curtidas: Number(atualizada.curtidas || 0)
					});
				} catch (erro) {
					console.error("Erro ao alternar curtida:", erro);

					res.status(500).json({
						erro: "Erro ao atualizar curtida."
					});
				}
			}
		);

		app.put("/api/publicacao/:id", autenticarToken, async (req, res) => {
			try {
				if (!ObjectId.isValid(req.params.id)) {
					return res.status(400).json({
						erro: "ID da publicação inválido."
					});
				}

				const dados = { ...req.body };
				delete dados._id;
				delete dados.curtidoPor;
				delete dados.curtidas;

				const resultado = await db
					.collection("publicacao")
					.updateOne(
						{ _id: new ObjectId(req.params.id) },
						{ $set: dados }
					);

				if (resultado.matchedCount === 0) {
					return res.status(404).json({
						erro: "Publicação não encontrada."
					});
				}

				res.json({
					mensagem: "Publicação atualizada com sucesso!"
				});
			} catch (erro) {
				console.error(erro);
				res.status(500).json({
					erro: "Erro ao atualizar publicação."
				});
			}
		});

		app.delete("/api/publicacao/:id", autenticarToken, async (req, res) => {
			try {
				if (!ObjectId.isValid(req.params.id)) {
					return res.status(400).json({
						erro: "ID da publicação inválido."
					});
				}

				const resultado = await db
					.collection("publicacao")
					.deleteOne({
						_id: new ObjectId(req.params.id)
					});

				if (resultado.deletedCount === 0) {
					return res.status(404).json({
						erro: "Publicação não encontrada."
					});
				}

				res.json({
					mensagem: "Publicação excluída com sucesso!"
				});
			} catch (erro) {
				console.error(erro);
				res.status(500).json({
					erro: "Erro ao excluir publicação."
				});
			}
		});

		app.listen(PORT, () => {
			console.log(`API rodando na porta ${PORT}`);
		});
	} catch (erro) {
		console.error("Erro ao conectar ao MongoDB:", erro.message);
		process.exit(1);
	}
}

iniciarServidor();