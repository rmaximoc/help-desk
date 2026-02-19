# HelpDesk — Guia para Agentes

Sistema de help desk com controle de acesso por roles (Admin, Técnico, Cliente), gestão de chamados e serviços.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite + TypeScript + TailwindCSS |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Banco | PostgreSQL 15 |
| Auth | JWT (Bearer, 7d) |
| Validação | Zod (backend e frontend) |
| Containerização | Docker Compose |

## Portas

| Serviço | Dev | Docker |
|---------|-----|--------|
| Frontend | 5173 | 80 |
| Backend | 3333 | 3000 |
| PostgreSQL | 5432 | 5432 |

O Vite faz proxy de `/api/*` → `http://localhost:3333`.

## Como rodar (desenvolvimento)

```bash
# 1. Banco de dados
docker-compose up -d postgres

# 2. Backend (terminal separado)
cd backend && npm run dev

# 3. Frontend (terminal separado)
cd frontend && npm run dev
```

## Credenciais do banco (dev)

```
POSTGRES_USER=helpdesk
POSTGRES_PASSWORD=helpdesk123
POSTGRES_DB=helpdesk
DATABASE_URL=postgresql://helpdesk:helpdesk123@localhost:5432/helpdesk?schema=public
```

## Usuários seed

| Role | Email | Senha |
|------|-------|-------|
| ADMIN | admin@helpdesk.com | admin123 |
| TECHNICIAN | tecnico@helpdesk.com | tech123 |
| CLIENT | cliente@helpdesk.com | client123 |

## Estrutura de pastas

```
helpDesk/
├── backend/          # API Express
├── frontend/         # SPA React
├── docker-compose.yml
└── .env.example
```

## Arquivos críticos

- `docker-compose.yml` — orquestra postgres, backend e frontend
- `backend/.env` — variáveis de ambiente do backend (não commitado)
- `backend/prisma/schema.prisma` — modelos de dados
- `frontend/vite.config.ts` — configuração do proxy `/api`
