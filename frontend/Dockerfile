# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Argumentos de build
ARG VITE_API_URL

# Definir variáveis de ambiente para o build
ENV VITE_API_URL=$VITE_API_URL

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Production stage - usar nginx para servir arquivos estáticos
FROM nginx:alpine AS production

# Copiar arquivos built para o nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

# Comando padrão
CMD ["nginx", "-g", "daemon off;"]
