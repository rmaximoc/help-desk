# Help Desk System

Sistema de Help Desk completo com backend Node.js e frontend React.

## Tecnologias

### Backend
- Node.js + Express.js
- TypeScript
- PostgreSQL + Prisma ORM
- JWT para autenticação
- Zod para validação
- Jest para testes

### Frontend
- React + Vite
- TypeScript
- TailwindCSS
- React Hook Form + Zod
- React Router DOM
- Axios

### DevOps
- Docker + Docker Compose

## Funcionalidades

### Admin
- Dashboard com estatísticas
- Gerenciamento de técnicos (CRUD + senha temporária)
- Gerenciamento de clientes (CRUD + exclusão em cascata)
- Gerenciamento de serviços (CRUD + soft delete)
- Visualização de todos os chamados

### Técnico
- Dashboard com chamados atribuídos
- Listagem de chamados com filtros
- Atualização de status (Aberto → Em Atendimento → Encerrado)
- Adição de serviços ao chamado
- Edição de perfil e avatar

### Cliente
- Auto-cadastro
- Dashboard com histórico de chamados
- Criação de chamados (seleção de técnico e serviços)
- Visualização de detalhes dos chamados
- Edição de perfil e avatar
- Exclusão de conta

## Instalação

### Desenvolvimento Local

1. Clone o repositório
```bash
git clone <repo-url>
cd helpDesk
```

2. Configurar Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

3. Configurar Frontend
```bash
cd frontend
npm install
npm run dev
```

### Com Docker

```bash
cp .env.example .env
docker-compose up -d
```

## Usuários Padrão (Seed)

- **Admin**: admin@helpdesk.com / admin123
- **Técnico**: tecnico@helpdesk.com / tech123
- **Cliente**: cliente@helpdesk.com / client123

## Estrutura do Projeto

```
helpDesk/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── client/
│   │   │   └── technician/
│   │   ├── services/
│   │   └── types/
│   └── public/
└── docker-compose.yml
```

## API Endpoints

### Autenticação
- POST /api/auth/login
- POST /api/auth/register

### Técnicos (Admin)
- GET /api/technicians
- POST /api/technicians
- GET /api/technicians/:id
- PUT /api/technicians/:id
- GET /api/technicians/available

### Clientes (Admin)
- GET /api/clients
- POST /api/clients
- GET /api/clients/:id
- PUT /api/clients/:id
- DELETE /api/clients/:id

### Serviços (Admin)
- GET /api/services
- POST /api/services
- GET /api/services/:id
- PUT /api/services/:id
- PATCH /api/services/:id/activate
- PATCH /api/services/:id/deactivate

### Chamados
- GET /api/tickets
- POST /api/tickets
- GET /api/tickets/:id
- GET /api/tickets/own (Cliente)
- GET /api/tickets/assigned (Técnico)
- PATCH /api/tickets/:id/status
- POST /api/tickets/:id/services

## Deploy

### Backend (Render)
1. Criar Web Service
2. Conectar repositório
3. Configurar variáveis de ambiente
4. Build command: `npm install && npx prisma generate && npm run build`
5. Start command: `npx prisma migrate deploy && npm start`

### Frontend (Vercel)
1. Importar projeto
2. Framework Preset: Vite
3. Configurar VITE_API_URL apontando para backend no Render

## Licença

MIT
