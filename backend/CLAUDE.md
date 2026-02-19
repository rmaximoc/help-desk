# Backend — Guia para Agentes

API REST em Express + TypeScript com Prisma ORM e PostgreSQL.

## Comandos

```bash
npm run dev              # Desenvolvimento (tsx watch)
npm run build            # Compila TypeScript → dist/
npm start                # Executa dist/server.js
npm test                 # Jest
npx prisma migrate dev   # Cria/aplica migration
npx prisma db seed       # Popula banco com dados iniciais
npx prisma studio        # GUI do banco
```

## Arquitetura

```
Requisição → Route → Middleware (auth/validate/role) → Controller → Service → Prisma → PostgreSQL
```

Padrão: **Routes → Controllers → Services → Database**

Nunca coloque lógica de negócio em controllers — use Services.

## Estrutura

```
src/
├── server.ts           # Entry point, porta 3333
├── app.ts              # Express app, CORS, middlewares, rotas
├── config/
│   ├── env.ts          # Carrega e valida variáveis de ambiente
│   ├── database.ts     # Instância do Prisma Client
│   └── upload.ts       # Configuração do Multer (5MB, pasta uploads/)
├── routes/
│   ├── index.ts        # Agrega todas as rotas sob /api
│   ├── auth.routes.ts
│   ├── client.routes.ts
│   ├── technician.routes.ts
│   ├── service.routes.ts
│   └── ticket.routes.ts
├── controllers/        # Recebe req/res, chama service, retorna resposta
├── services/           # Lógica de negócio, acessa Prisma
├── schemas/            # Schemas Zod para validação de entrada
├── middlewares/
│   ├── auth.middleware.ts      # Valida JWT Bearer
│   ├── role.middleware.ts      # Controle de acesso por role
│   ├── validate.middleware.ts  # Valida body com Zod
│   └── error.middleware.ts     # Handler global de erros
├── types/index.ts      # JwtPayload e interfaces globais
└── utils/
    ├── errors.ts       # Classes de erro customizadas
    └── helpers.ts      # Utilitários
```

## Endpoints

### Auth
- `POST /api/auth/login` — público
- `GET /api/auth/profile` — autenticado
- `PATCH /api/auth/change-password` — autenticado

### Clientes
- `POST /api/clients/register` — público (auto-cadastro)
- `GET /api/clients` — admin
- `GET /api/clients/:id` — admin
- `PUT /api/clients/:id` — admin
- `DELETE /api/clients/:id` — admin
- `PATCH /api/clients/profile` — client
- `DELETE /api/clients/account` — client
- `POST /api/clients/avatar` — client

### Técnicos
- `GET /api/technicians` — admin
- `POST /api/technicians` — admin
- `GET /api/technicians/available` — autenticado
- `GET /api/technicians/:id` — admin
- `PUT /api/technicians/:id` — admin

### Serviços
- `GET /api/services` — autenticado
- `POST /api/services` — admin
- `PUT /api/services/:id` — admin
- `PATCH /api/services/:id/activate` — admin
- `PATCH /api/services/:id/deactivate` — admin

### Chamados
- `GET /api/tickets` — autenticado (filtrado por role)
- `POST /api/tickets` — client
- `GET /api/tickets/:id` — autenticado
- `PATCH /api/tickets/:id/status` — technician/admin
- `POST /api/tickets/:id/services` — technician/admin

## Modelos Prisma

```
User (ADMIN | TECHNICIAN | CLIENT)
  └─ Technician (availableHours: string[])
       └─ Ticket[] (OPEN | IN_PROGRESS | CLOSED)
  └─ Client
       └─ Ticket[]

Service ──< TicketService >── Ticket
  (price snapshot no momento da adição)
```

Deleção de User cascateia para Technician/Client e seus Tickets.

## Middlewares de acesso

```typescript
authenticate          // verifica JWT
adminOnly             // role === ADMIN
technicianOnly        // role === TECHNICIAN
clientOnly            // role === CLIENT
```

## Erros customizados

```typescript
new NotFoundError('msg')      // 404
new ConflictError('msg')      // 409
new UnauthorizedError('msg')  // 401
new ValidationError('msg')    // 400
```

## Variáveis de ambiente necessárias

```
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://helpdesk:helpdesk123@localhost:5432/helpdesk?schema=public
JWT_SECRET=...
JWT_EXPIRES_IN=7d
UPLOAD_FOLDER=uploads
MAX_FILE_SIZE=5242880
```
