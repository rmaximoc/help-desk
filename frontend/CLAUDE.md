# Frontend — Guia para Agentes

SPA em React 18 + Vite + TypeScript + TailwindCSS.

## Comandos

```bash
npm run dev       # Dev server na porta 5173
npm run build     # Build de produção → dist/
npm run preview   # Preview do build
npm run lint      # ESLint
```

## Proxy

Todas as chamadas para `/api/*` são redirecionadas pelo Vite para `http://localhost:3333`.
Configurado em `vite.config.ts`. O backend precisa estar rodando.

## Estrutura

```
src/
├── App.tsx                  # Roteamento completo com guards por role
├── contexts/
│   └── AuthContext.tsx      # Estado global de autenticação
├── components/
│   ├── Layout.tsx           # Sidebar + nav + logout (envolve páginas autenticadas)
│   └── ProtectedRoute.tsx   # Guard de rota por role
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx  # Rota: /register (somente email e senha)
│   ├── admin/
│   │   ├── Dashboard.tsx
│   │   ├── TechniciansPage.tsx
│   │   ├── ClientsPage.tsx
│   │   ├── ServicesPage.tsx
│   │   └── TicketsPage.tsx
│   ├── technician/
│   │   ├── Dashboard.tsx
│   │   ├── TicketsPage.tsx
│   │   └── ProfilePage.tsx
│   └── client/
│       ├── Dashboard.tsx
│       ├── TicketsPage.tsx
│       ├── NewTicketPage.tsx
│       └── ProfilePage.tsx
├── services/
│   ├── api.ts               # Instância Axios + interceptors (token + 401)
│   ├── auth.service.ts
│   ├── client.service.ts
│   ├── technician.service.ts
│   ├── service.service.ts
│   └── ticket.service.ts
└── types/
    └── index.ts             # Interfaces TypeScript de todos os modelos
```

## Rotas

| Path | Acesso | Componente |
|------|--------|------------|
| `/login` | público | LoginPage |
| `/register` | público | RegisterPage |
| `/admin` | ADMIN | AdminDashboard |
| `/admin/tecnicos` | ADMIN | TechniciansPage |
| `/admin/clientes` | ADMIN | ClientsPage |
| `/admin/servicos` | ADMIN | ServicesPage |
| `/admin/chamados` | ADMIN | AdminTicketsPage |
| `/tecnico` | TECHNICIAN | TechnicianDashboard |
| `/tecnico/chamados` | TECHNICIAN | TechnicianTicketsPage |
| `/tecnico/perfil` | TECHNICIAN | TechnicianProfilePage |
| `/dashboard` | CLIENT | ClientDashboard |
| `/chamados` | CLIENT | ClientTicketsPage |
| `/chamados/novo` | CLIENT | NewTicketPage |
| `/perfil` | CLIENT | ClientProfilePage |

Após login, redireciona por role: ADMIN→`/admin`, TECHNICIAN→`/tecnico`, CLIENT→`/dashboard`.

## AuthContext

```typescript
const { user, isAuthenticated, isLoading, login, logout, updateUser } = useAuth();
```

- Token e user persistidos no `localStorage`
- Interceptor Axios adiciona `Authorization: Bearer <token>` automaticamente
- Erros 401 limpam o storage e redirecionam para `/login`

## Padrões de código

- Formulários: **React Hook Form** + **Zod** (schema local na própria página)
- Notificações: `toast.success()` / `toast.error()` via **react-hot-toast**
- Ícones: **Lucide React**
- Loading state: ícone `<Loader2 className="animate-spin" />` no botão de submit
- Classes CSS: **TailwindCSS** com classes customizadas `btn-primary`, `input`, `label` (definidas no CSS global)

## Exemplo de formulário

```tsx
const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});

const onSubmit = async (data: FormData) => {
  try {
    await service.metodo(data);
    toast.success('Sucesso!');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Erro');
  }
};
```

## Tipos principais (`src/types/index.ts`)

```typescript
type Role = 'ADMIN' | 'TECHNICIAN' | 'CLIENT'
type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED'

interface User { id, name, email, role, avatarUrl, isFirstAccess, createdAt }
interface Client { id, userId, name, email, avatarUrl, ticketsCount?, createdAt }
interface Technician { id, userId, name, email, availableHours, isFirstAccess?, createdAt }
interface Service { id, name, description, price, isActive, createdAt }
interface Ticket { id, status, description, client?, technician?, services, totalPrice, createdAt, updatedAt }
```
