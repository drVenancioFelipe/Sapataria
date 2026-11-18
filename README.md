# RenovaCalçados

Sistema local de gestão para renovadoras de calçados, desenvolvido com Node.js + Fastify (backend) e Angular 21 (frontend).

## Visão geral

O RenovaCalçados é um sistema de gestão completo para sapatarias e renovadoras de calçados, oferecendo:

- **Ordens de Serviço**: Abertura, acompanhamento e encerramento de OS com protocolo único
- **Gestão de Clientes**: Cadastro, histórico de serviços e conformidade LGPD
- **Fila de Produção**: Controle visual dos itens em andamento por sapateiro
- **Financeiro**: Controle de pagamentos, despesas e fechamento de caixa
- **Relatórios**: Exportação de dados para análise
- **Multi-perfil**: Admin, Atendente e Sapateiro com permissões distintas
- **Privacidade (LGPD)**: Consentimento de WhatsApp, anonimização e opt-out

## Requisitos

- **Node.js** 20 ou superior (testado com Node.js 24)
- **npm** 10 ou superior
- Windows 10/11 (para o `start.bat`)

> Não é necessário instalar nada no banco de dados — o sistema usa SQLite embutido.

## Instalação e uso

### Windows (recomendado)

1. Clone ou extraia o repositório em `C:\Desenvolvimento\workspace\sapataria`
2. Dê duplo clique em **`start.bat`**

O script irá automaticamente:
- Instalar dependências do backend (`npm install`)
- Instalar dependências do frontend (`npm install`)
- Compilar o Angular para produção (`ng build`)
- Iniciar o servidor em `http://localhost:4200`
- Abrir o navegador automaticamente

### Manual (linha de comando)

```bash
# Instalar tudo
npm run install:all

# Compilar frontend
npm run build:frontend

# Iniciar servidor (backend serve o frontend compilado)
npm start
```

### Desenvolvimento

```bash
# Backend com hot-reload
cd backend && npm run dev

# Frontend em modo dev (porta 4201)
cd frontend && npm start
```

## Estrutura do projeto

```
sapataria/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts       # Definição das tabelas SQLite
│   │   │   └── seed.ts         # Dados iniciais e de exemplo
│   │   ├── routes/
│   │   │   ├── auth.ts         # Autenticação JWT
│   │   │   ├── clientes.ts     # CRUD de clientes
│   │   │   ├── os.ts           # Ordens de serviço
│   │   │   └── config.ts       # Configurações da loja
│   │   ├── services/           # Serviços de negócio
│   │   ├── middleware/         # Middlewares Fastify
│   │   └── server.ts           # Ponto de entrada
│   ├── fotos/                  # Fotos dos calçados (gitignore)
│   ├── backups/                # Backups do banco (gitignore)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Services, guards, interceptors
│   │   │   ├── shared/         # Componentes compartilhados
│   │   │   └── features/       # Módulos de feature (lazy loaded)
│   │   ├── styles.scss         # Estilos globais e variáveis CSS
│   │   ├── index.html
│   │   └── main.ts
│   ├── angular.json
│   └── package.json
├── start.bat                   # Script de inicialização Windows
├── package.json                # Scripts raiz
└── README.md
```

## Perfis de usuário

| Perfil | Acesso |
|--------|--------|
| **Admin** | Acesso total: configurações, usuários, relatórios, fechamento de caixa |
| **Atendente** | Abertura/edição de OS, cadastro de clientes, recebimento de pagamentos |
| **Sapateiro** | Visualização da fila, atualização de status dos itens |

## Primeiro acesso

1. Acesse `http://localhost:4200`
2. O sistema detecta automaticamente que não há administrador e redireciona para a tela de **Configuração Inicial**
3. Crie o usuário administrador
4. **Guarde a chave de recuperação** exibida após o cadastro — ela é necessária para recuperar o acesso em caso de perda de senha

## Backup e recuperação

O banco de dados SQLite fica em `backend/renovacalcados.db`. Para fazer backup:

```bash
# Copiar o arquivo de banco (com o servidor parado)
copy backend\renovacalcados.db backend\backups\backup-YYYYMMDD.db
```

Para restaurar, substitua o arquivo `renovacalcados.db` pelo backup desejado e reinicie o servidor.

## Configuração de impressora

O sistema gera comprovantes em formato HTML para impressão via navegador. Configure a impressora padrão no Windows antes de imprimir. Recomenda-se impressora térmica 80mm para comprovantes de OS.

## Notas de privacidade (LGPD)

Este sistema implementa:

- **Consentimento explícito** para envio de mensagens via WhatsApp
- **Opt-out**: clientes podem revogar o consentimento a qualquer momento
- **Anonimização**: dados pessoais podem ser removidos a pedido do titular
- **Auditoria**: todas as ações são registradas com usuário, data/hora e IP
- **Responsável pelo tratamento**: Passo a Passo Renovadora de Calçados
- **Contato LGPD**: (31) 3077-8190

Os dados são armazenados **localmente** no dispositivo da loja. Nenhuma informação é enviada a servidores externos.
