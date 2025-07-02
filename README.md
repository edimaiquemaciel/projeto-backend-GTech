# Projeto Backend - API REST

Uma API REST completa para e-commerce desenvolvida com Node.js, Express e Sequelize, oferecendo funcionalidades de gerenciamento de usuários, produtos e categorias com autenticação JWT.

## 📋 Sumário

- [Características](#características)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Endpoints da API](#endpoints-da-api)
- [Autenticação](#autenticação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Testes](#testes)
- [Contribuição](#contribuição)
- [Licença](#licença)

## ✨ Características

- **Autenticação JWT** - Sistema completo de autenticação com tokens
- **CRUD Completo** - Operações para usuários, produtos e categorias
- **Relacionamentos Complexos** - Produtos com categorias, imagens e opções
- **Busca Avançada** - Filtros por nome, preço, categorias e opções
- **Validação de Dados** - Validação robusta com Sequelize
- **Middleware de Segurança** - Proteção de rotas sensíveis
- **Criptografia de Senhas** - Hash seguro com bcrypt
- **Paginação** - Sistema de paginação para listagens
- **Transações** - Operações seguras no banco de dados

## 🛠 Tecnologias Utilizadas

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **ORM**: Sequelize 6.37.7
- **Banco de Dados**: MySQL 2 (mysql2 3.14.1)
- **Autenticação**: JSON Web Token (jsonwebtoken 9.0.2)
- **Criptografia**: bcrypt 6.0.0
- **Variáveis de Ambiente**: dotenv 17.0.0
- **Desenvolvimento**: nodemon 3.1.10
- **Testes**: Jest 29.7.0, Supertest 7.1.1

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- MySQL (versão 5.7 ou superior)
- npm ou yarn

## 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/edimaiquemaciel/projeto-backend-GTech.git
   cd projeto-backend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o banco de dados**
   - Crie um banco de dados MySQL
   - Configure as tabelas necessárias (veja estrutura abaixo)

## ⚙️ Configuração

1. **Crie um arquivo `.env` na raiz do projeto:**
   ```env
   DB_HOST=localhost
   DB_NAME=seu_banco_de_dados
   DB_USER=seu_usuario
   DB_PASS=sua_senha
   DB_PORT=3000
   JWT_SECRET=sua_chave_secreta_jwt
   ```

2. **Estrutura do Banco de Dados**
   
   O projeto utiliza as seguintes tabelas:
   - `usuarios` - Dados dos usuários
   - `categorias` - Categorias de produtos
   - `produtos` - Produtos do e-commerce
   - `produtos_categorias` - Relacionamento produtos-categorias
   - `imagens_produto` - Imagens dos produtos
   - `opcoes_produto` - Opções/variações dos produtos

## 📱 Uso

### Desenvolvimento
```bash
npm start
```

### Testes
```bash
npm test
```

A API estará disponível em `http://localhost:3000`

## 🛡 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. 

### Obter Token
```http
POST /v1/user/token
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

### Usar Token
```http
Authorization: Bearer seu_jwt_token_aqui
```

**Rotas Protegidas**: Todas as operações POST, PUT e DELETE exigem autenticação, exceto criação de usuário e login.

## 📚 Endpoints da API

### 👤 Usuários

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/v1/user/:id` | Buscar usuário por ID | ❌ |
| POST | `/v1/user` | Criar usuário | ❌ |
| PUT | `/v1/user/:id` | Atualizar usuário | ✅ |
| DELETE | `/v1/user/:id` | Deletar usuário | ✅ |
| POST | `/v1/user/token` | Gerar token JWT | ❌ |

### 🏷 Categorias

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/v1/category/search` | Listar categorias | ❌ |
| GET | `/v1/category/:id` | Buscar categoria por ID | ❌ |
| POST | `/v1/category` | Criar categoria | ✅ |
| PUT | `/v1/category/:id` | Atualizar categoria | ✅ |
| DELETE | `/v1/category/:id` | Deletar categoria | ✅ |

### 🛍 Produtos

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/v1/product/search` | Buscar produtos | ❌ |
| GET | `/v1/product/:id` | Buscar produto por ID | ❌ |
| POST | `/v1/product` | Criar produto | ✅ |
| PUT | `/v1/product/:id` | Atualizar produto | ✅ |
| DELETE | `/v1/product/:id` | Deletar produto | ✅ |

### 🔍 Parâmetros de Busca

#### Produtos (`/v1/product/search`)
- `limit` - Limite de resultados (-1 para todos)
- `page` - Página atual
- `fields` - Campos específicos
- `match` - Busca por nome/descrição
- `category_ids` - IDs das categorias (separados por vírgula)
- `price-range` - Faixa de preço (formato: min-max)
- `option[id]` - Filtro por opções específicas

#### Categorias (`/v1/category/search`)
- `limit` - Limite de resultados
- `page` - Página atual
- `fields` - Campos específicos
- `use_in_menu` - Filtrar por uso no menu (true/false)

## 📁 Estrutura do Projeto

```
projeto-backend/
├── src/
│   ├── config/
│   │   └── connection.js          # Configuração do banco
│   ├── controllers/
│   │   ├── AuthController.js      # Autenticação
│   │   ├── CategoriasController.js # Gestão de categorias
│   │   ├── ProdutosController.js  # Gestão de produtos
│   │   └── UsuariosController.js  # Gestão de usuários
│   ├── middleware/
│   │   └── validarToken.js        # Middleware de autenticação
│   ├── models/
│   │   ├── CategoriasModel.js     # Model de categorias
│   │   ├── ImagensProduto.js      # Model de imagens
│   │   ├── OpcoesProduto.js       # Model de opções
│   │   ├── ProdutosCategoriaModel.js # Model de relacionamento
│   │   ├── ProdutosModel.js       # Model de produtos
│   │   ├── UsuariosModel.js       # Model de usuários
│   │   └── index.js               # Associações dos models
│   ├── routes/
│   │   ├── CategoriasRotas.js     # Rotas de categorias
│   │   ├── ProdutosRotas.js       # Rotas de produtos
│   │   └── UsuariosRotas.js       # Rotas de usuários
│   └── server.js                  # Servidor principal
├── package.json
└── .env                          # Variáveis de ambiente
```

## 🧪 Testes

O projeto inclui configuração para testes com Jest e Supertest:

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch
```

## 📋 Exemplos de Uso

### Criar Usuário
```json
POST /v1/user
{
  "firstname": "João",
  "surname": "Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

### Criar Produto
```json
POST /v1/product
{
  "name": "Produto Exemplo",
  "slug": "produto-exemplo",
  "price": 99.90,
  "price_with_discount": 79.90,
  "description": "Descrição do produto",
  "stock": 10,
  "enabled": true,
  "category_ids": [1, 2],
  "images": [
    {"content": "/path/to/image1.jpg"},
    {"content": "/path/to/image2.jpg"}
  ],
  "options": [
    {
      "title": "Cor",
      "type": "color",
      "values": ["Azul", "Verde", "Vermelho"]
    }
  ]
}
```

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `package.json` para mais detalhes.

---

**Desenvolvido para aprendizado e desenvolvimento de APIs REST modernas.**
