# InnovaGov

Uma aplicação web moderna para gestão e inovação governamental.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior) - [Download aqui](https://nodejs.org/)
- **pnpm** (gerenciador de pacotes) - [Guia de instalação](https://pnpm.io/pt/installation)

Se não tem pnpm instalado, execute:
```bash
npm install -g pnpm
```

## 🚀 Como rodar o projeto

### 1. Clonar o repositório

```bash
git clone <seu-repositorio>
cd InnovaGov
```

### 2. Instalar dependências

```bash
pnpm install
```

Isso vai baixar todas as dependências necessárias listadas no `package.json`.

### 3. Iniciar o servidor de desenvolvimento

```bash
pnpm run dev
```

O servidor vai iniciar em `http://localhost:5173` (ou outra porta disponível).

## 📦 Scripts disponíveis

- **`pnpm run dev`** - Inicia o servidor de desenvolvimento
- **`pnpm run build`** - Compila o projeto para produção
- **`pnpm run start`** - Executa a aplicação em modo de produção
- **`pnpm run preview`** - Visualiza o build de produção localmente
- **`pnpm run check`** - Verifica tipos TypeScript sem emitir arquivos
- **`pnpm run format`** - Formata o código com Prettier

## 🏗️ Estrutura do projeto

```
InnovaGov/
├── client/                 # Código do frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── contexts/      # Context API
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilitários
│   │   └── main.tsx       # Ponto de entrada
│   └── public/            # Arquivos estáticos
├── server/                # Código do backend (Node.js + Express)
├── shared/                # Código compartilhado entre cliente e servidor
├── package.json           # Dependências do projeto
└── pnpm-lock.yaml        # Lock file das dependências (NÃO MODIFIQUE)
```

## 🔧 Tecnologias utilizadas

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **UI Components**: Radix UI
- **Build Tool**: Vite + esbuild
- **Package Manager**: pnpm

## ⚙️ Variáveis de ambiente

Se precisar configurar variáveis de ambiente, crie um arquivo `.env.local` na raiz do projeto:

```bash
cp .env .env.local
```

Edite o arquivo `.env.local` com as variáveis necessárias.

## 🐛 Troubleshooting

### Erro: "pnpm command not found"
Instale pnpm globalmente:
```bash
npm install -g pnpm
```

### Porta já está em uso
O Vite tentará usar a próxima porta disponível automaticamente. Se quiser especificar uma porta:
```bash
pnpm run dev -- --port 3000
```

### Problemas com dependências
Limpe o cache e reinstale:
```bash
pnpm store prune
pnpm install
```

## 📝 Licença

MIT

## 👥 Contribuindo

Para contribuir com o projeto, faça um fork e envie um pull request.
