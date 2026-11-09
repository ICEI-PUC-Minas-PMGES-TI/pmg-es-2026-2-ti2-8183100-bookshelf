# Atualização visual e regras de leitura

Decisões confirmadas pelo usuário em 9 de novembro de 2026. A pasta `Bookmark layout novo` fornecida no workspace é a referência desta atualização.

## Identidade e alcance

Ações em marrom escuro, superfícies claras e títulos literários. A paleta utiliza espresso `#2A1A14`, café `#4A2F24`, papel `#FFFDF9`, creme `#FBF5EB` e linhas suaves `#E4D2BD`. Fraunces é a fonte de títulos e Source Sans 3 é a fonte de interface.

Este bloco atualiza o perfil, o cabeçalho, os componentes compartilhados, o catálogo, o feed, o login, o cadastro e a apresentação das métricas. As regras abaixo orientam a implementação posterior da home e da lógica de leitura.

## Etapas dos commits

Todos os commits foram feitos na branch `LkConfigurações`.

| Etapa | Commit | Alteração |
|---|---|---|
| 1 | `e8b57dd` | Identidade em marrom e papel, cabeçalho, temas, cartões, capas e diálogos compartilhados. |
| 2 | `48988a6` | Perfil com abas acessíveis, favoritos, troca de listas e recuperação em caso de erro ao salvar. |
| 3 | `9c26008` | Feed e resenhas com visual atualizado e retirada das curtidas da interface. |
| 4 | `22a8c42` | Catálogo com até 40 resultados por requisição e navegação entre páginas, preservando a pesquisa. |
| 5 | `9f93404` | Login e cadastro com campos legíveis, feedback de envio e tratamento de erros. |
| 6 | `e874e61` | Painel de métricas, calendário em português, diálogo de leitura e chama para representar a sequência. |
| 7 | Documentação | Registro das decisões, validações e limites desta entrega neste documento. |

Cada commit de código possui uma descrição da etapa no corpo da mensagem. A compilação de produção e o lint de App, cartões, capa, cadastro, login, perfil, catálogo, métricas e diálogo de leitura passaram antes da conclusão dos commits. A inspeção visual e os testes do serviço de paginação estão detalhados em Verificação.

## Alterações implementadas

- Cabeçalho com nome BookMark, símbolo de marcador, navegação, tema e perfil. No celular, os destinos ficam em uma segunda linha.
- Perfil com foto, identificação e ações em um cabeçalho compacto.
- Biblioteca com abas Lendo, Pretendo ler, Lidos e Favoritos. A abertura inicial ocorre em Lendo.
- Navegação das abas por clique, setas, Home e End. Cada aba informa a quantidade e identifica o painel correspondente.
- Listas vazias apresentam uma ação para explorar o catálogo.
- Livros mostram título, autor, favorito e seletor de lista. O arraste também permite soltar livros nas abas de destino.
- Alterações de listas são serializadas. Durante o envio, os controles ficam bloqueados. Em caso de falha, o estado anterior é restaurado.
- Capa compartilhada pelo perfil e catálogo, com reserva quando a imagem falta ou falha.
- Molduras pesadas removidas do perfil e reduzidas nas superfícies do catálogo e feed. Sombras e títulos foram reduzidos.
- Catálogo mantém busca, idiomas, tipos, categorias, ordenação e estados de consulta.
- No celular, gênero e avaliação utilizam seletores compactos. A troca de página retorna ao topo para evitar conteúdo coberto pelo cabeçalho fixo.
- Feed mantém busca, avaliações, publicação de resenhas e ordenação por data ou avaliação. O controle de curtidas e a ordenação por curtidas saíram da interface, seguindo a direção de comunidade definida pelo usuário.
- Os endpoints e dados históricos de curtidas continuam existentes no backend. Sua retirada dos requisitos deve ser alinhada com a equipe.
- Configurações e edição de perfil acompanham a direção em marrom. Os temas claro e escuro continuam disponíveis.

## Regras confirmadas para a próxima etapa funcional

| Assunto | Decisão |
|---|---|
| Registro | Leitura registrada por páginas. |
| Sequência | Qualquer quantidade válida de páginas conta, sem meta mínima de páginas por dia. |
| Dia sem leitura | A sequência reinicia no próximo dia com registro e o recorde pessoal é preservado. |
| Data | Somente registros do próprio dia. Registros retroativos ficam indisponíveis. |
| Progresso | Percentual calculado a partir da página atual e do total de páginas da edição. |
| Total de páginas | O usuário pode informar ou corrigir o total antes do cálculo do percentual. |
| Conclusão | Ao atingir o total, solicitar confirmação antes de mover o livro para Lidos. |
| Tempo | Tempo de leitura deixa de fazer parte do produto planejado. |

Várias sessões na mesma data devem contabilizar um único dia na sequência. A página atual e o total permanecem como dados originais, e o percentual é uma representação calculada.

Ainda precisam de detalhamento técnico o fuso que define o dia, a correção de registros do próprio dia, as releituras e a migração dos dados anteriores. A implementação deverá impedir duplicação de avanço em reenvios e preservar o histórico existente durante a migração.

## Limites deste bloco

O novo cálculo da sequência, a confirmação ao atingir a última página e a correção do total ainda serão implementados na etapa funcional. O tempo já foi retirado da apresentação das métricas; sua remoção do armazenamento e a integração das estatísticas aos registros continuam pendentes.

Publicações com fotos e perfis públicos fazem parte da evolução da comunidade e ainda precisam de implementação. Este bloco aplica a nova aparência ao fluxo existente de resenhas.

As alterações foram commitadas na branch `LkConfigurações`, conforme a autorização do usuário. A `main` não foi alterada.

## Verificação

### Sequência e paginação do catálogo

A maior sequência recebeu um ícone de chama da biblioteca de ícones existente, com traço e cor alinhados ao marrom da interface.

O catálogo solicita até 40 volumes por requisição, limite documentado pelo Google Books. Os controles Anterior e Próxima navegam usando `startIndex`, mantendo termo, idioma e tipo de publicação. Uma nova busca retorna à primeira página. A vitrine inicial passou a usar uma consulta estável de ficção para evitar a troca de autor durante a paginação. Gênero e ordenação continuam locais à página, com essa abrangência indicada na interface.

O serviço de busca anterior continua retornando um array para seus consumidores. A nova função de paginação acrescenta os metadados necessários ao catálogo. Testes com respostas simuladas verificaram limite, deslocamento, filtros, página vazia e compatibilidade. Compilação e lint dos arquivos alterados aprovados.

Referência técnica — [Paginação do Google Books](https://developers.google.com/books/docs/v1/using#pagination).

### Login, cadastro e métricas

Login e cadastro receberam a mesma paleta de marrom escuro, campos com texto e cursor de alto contraste, rótulos associados, preenchimento automático e feedback de carregamento e erro. O cadastro reaproveita o diálogo acessível, mantém o formulário aberto quando a API falha e retorna o e-mail para a entrada após concluir. O login agora direciona para o perfil após autenticar.

A tela de métricas apresenta páginas lidas, livros concluídos e o campo de sequência já armazenado, além do calendário em português, leituras atuais e favoritos. Horas e minutos foram retirados da apresentação. A consulta apresenta carregamento e erro explícitos. O botão Registrar leitura abre um diálogo com validação de páginas e feedback de envio, utilizando o endpoint anterior de métricas.

O cálculo diário da sequência e a integração dos registros às estatísticas continuam dependendo da evolução funcional do backend. O calendário destaca o dia atual e permite navegar pelas datas. Ele ainda não identifica dias com sessões registradas. O valor apresentado como maior sequência continua sendo o campo legado utilizado pela tela anterior.

Compilação e lint de login, cadastro, métricas e diálogo de leitura aprovados. Login, cadastro e métricas foram inspecionados em tela larga e móvel, incluindo o tema escuro e o contraste dos campos. Criação de conta e gravação de leitura precisam ser conferidas com dados descartáveis em ambiente de teste.

Compilação de produção aprovada. Lint do perfil, cabeçalho, capa, cartões, modal e catálogo aprovado. O feed ainda apresenta um apontamento anterior de atualização de estado em efeito de busca.

Perfil, catálogo e feed foram inspecionados em largura móvel de 390 pixels e desktop de 1440 pixels, com consulta de dados existentes. As abas foram verificadas por clique e teclado, incluindo uma lista vazia. O formulário de resenha e o modal de configurações foram abertos para conferir apresentação e controles. O tema escuro também foi inspecionado no perfil.

O salvamento das listas mantém o serviço existente e precisa de validação em ambiente de teste com dados descartáveis para conferir persistência e recuperação de falhas de rede. Nesta inspeção visual, os controles de alteração da biblioteca publicada não foram acionados.
