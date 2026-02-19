import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/database.js';
import fs from 'fs';
import path from 'path';

// Cria a pasta de uploads se não existir
const uploadsPath = path.resolve(process.cwd(), env.UPLOAD_FOLDER);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

async function main() {
  try {
    // Testa a conexão com o banco
    await prisma.$connect();
    console.log('📦 Conectado ao banco de dados');

    // Inicia o servidor
    app.listen(env.PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${env.PORT}`);
      console.log(`📋 Ambiente: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
