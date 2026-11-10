# Configurações do usuário

Entrega da issue #18, desenvolvida na branch `LkConfigurações`.

## Backend da conta e senhas

- Atualização e exclusão permitidas somente para o dono da conta autenticada.
- Validação de e-mail e verificação de endereço já cadastrado.
- Alteração de e-mail ou senha exige a senha atual.
- Senhas novas protegidas com scrypt. Contas anteriores continuam autenticando e adotam a proteção ao trocar a senha.
- Consultas de usuários deixam de devolver o campo de senha.
- Exclusão exige a senha atual e a confirmação `EXCLUIR`.
- Atualizações verificam a senha armazenada antes de gravar, evitando sobrescrever uma troca de senha concorrente.

O painel usa `PUT /api/configuracoes/:id` e `DELETE /api/configuracoes/:id`. Essas rotas reutilizam os mesmos manipuladores das rotas existentes de usuário. Os aliases exigem o backend atualizado, evitando enviar as novas operações à implementação antiga publicada.

## Temas claro e escuro

- Seletor nas configurações e atalho de sol ou lua no cabeçalho.
- Preferência aplicada imediatamente e salva neste navegador em `bookmark-tema`.
- Tema restaurado ao abrir a aplicação.
- Cores existentes passaram a usar variáveis com os valores originais como padrão do tema claro.
- Ajuste do cabeçalho em telas estreitas para acomodar o atalho de tema.

## Pop-up de configurações

O acesso fica no botão Configurações do perfil.

| Seção | Funcionalidade |
|---|---|
| Conta | Editar nome, nome de usuário e e-mail. |
| Aparência | Escolher tema claro ou escuro. |
| Segurança | Alterar senha ou confirmar a exclusão da conta. |

- Formulários exibem validações, carregamento, sucesso e falhas de conexão.
- Dados digitados são preservados durante uma falha de salvamento.
- Ao fechar com alterações pendentes, o usuário escolhe continuar editando ou descartar.
- O diálogo existente foi reaproveitado com identificadores acessíveis únicos e classe visual específica.
- Navegação lateral no computador e horizontal no celular.
- Visual editorial em terracota, com Baskervville nos títulos e Source Sans 3 nos controles.
- Dados de nome e usuário são atualizados no perfil e no armazenamento da sessão após salvar.
- O serviço consulta o identificador atual da sessão a cada requisição.

## Verificação realizada

- Compilação de produção aprovada com `npm run build` no frontend.
- Lint dos arquivos JavaScript e JSX alterados aprovado.
- Sintaxe do backend e diferenças de Git verificadas.
- Modal inspecionado em tela larga e em 390 × 844, nos temas claro e escuro.
- Validação de campos, proteção contra descarte e confirmação de exclusão conferidas na interface.
- Rotas verificadas com contas fictícias e armazenamento em memória, incluindo atualização, erros de validação, conflito de e-mail, identidade da conta, senha antiga e nova e exclusão confirmada.
- Aliases de configurações verificados usando os manipuladores reais e dados fictícios, sem acesso a banco externo.

## Como conferir a entrega

1. Disponibilizar o backend atualizado com MongoDB e autenticação configurados.
2. Configurar `VITE_API_URL` no frontend e iniciar com `npm run dev`.
3. Entrar com uma conta de teste e abrir Perfil, depois Configurações.
4. Alterar nome e usuário, salvar, recarregar e conferir os dados.
5. Alterar e-mail com a senha atual e conferir o novo acesso.
6. Alterar a senha e conferir o login com a senha nova.
7. Alternar o tema pelo painel e pelo cabeçalho e conferir a persistência ao recarregar.
8. Conferir campos inválidos, senhas diferentes, falha da API e descarte de alterações.
9. Com uma conta descartável, conferir a exclusão mediante senha e confirmação explícita.
10. Conferir navegação por teclado e comportamento em tela móvel.

## Pontos pendentes

- Validar o ciclo completo de atualização com o MongoDB real em ambiente de teste.
- Publicar o backend atualizado para habilitar os aliases no Render.
- Incluir a referência visual da entrega no Figma e na issue #18.
- Definir com a equipe o destino de publicações e arquivos associados a uma conta excluída. A exclusão atual remove o documento do usuário e os dados contidos nele.
- O lint geral ainda acusa problemas anteriores em outros componentes e serviços.
- A compilação aponta uma referência anterior à imagem ausente `/images/login-ilustracao.png`.

O redesign geral da home, biblioteca, comunidade e métricas continua como proposta para discussão com a equipe.
