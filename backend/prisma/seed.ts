import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Cria o admin padrão
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@helpdesk.com' },
    update: {},
    create: {
      email: 'admin@helpdesk.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
      isFirstAccess: false,
    },
  });

  console.log('✅ Admin criado:', admin.email);

  // Cria alguns serviços de exemplo
  const services = [
    { name: 'Formatação de Computador', description: 'Formatação completa com instalação do sistema operacional', price: 150.00 },
    { name: 'Limpeza de Vírus', description: 'Remoção de vírus e malware', price: 80.00 },
    { name: 'Instalação de Software', description: 'Instalação e configuração de programas', price: 50.00 },
    { name: 'Manutenção Preventiva', description: 'Limpeza física e otimização do sistema', price: 100.00 },
    { name: 'Recuperação de Dados', description: 'Recuperação de arquivos deletados ou corrompidos', price: 200.00 },
    { name: 'Configuração de Rede', description: 'Configuração de rede doméstica ou empresarial', price: 120.00 },
    { name: 'Upgrade de Hardware', description: 'Instalação de novos componentes', price: 80.00 },
    { name: 'Suporte Remoto', description: 'Atendimento remoto via TeamViewer/AnyDesk', price: 60.00 },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: service,
    });
  }

  console.log('✅ Serviços criados:', services.length);

  // Cria um técnico de exemplo
  const techPassword = await bcrypt.hash('tech123', 10);

  const techUser = await prisma.user.upsert({
    where: { email: 'tecnico@helpdesk.com' },
    update: {},
    create: {
      email: 'tecnico@helpdesk.com',
      password: techPassword,
      name: 'João Técnico',
      role: 'TECHNICIAN',
      isFirstAccess: false,
    },
  });

  await prisma.technician.upsert({
    where: { userId: techUser.id },
    update: {},
    create: {
      userId: techUser.id,
      availableHours: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
    },
  });

  console.log('✅ Técnico criado:', techUser.email);

  // Cria um cliente de exemplo
  const clientPassword = await bcrypt.hash('client123', 10);

  const clientUser = await prisma.user.upsert({
    where: { email: 'cliente@helpdesk.com' },
    update: {},
    create: {
      email: 'cliente@helpdesk.com',
      password: clientPassword,
      name: 'Maria Cliente',
      role: 'CLIENT',
      isFirstAccess: false,
    },
  });

  await prisma.client.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
    },
  });

  console.log('✅ Cliente criado:', clientUser.email);

  console.log('\n📝 Credenciais de acesso:');
  console.log('Admin: admin@helpdesk.com / admin123');
  console.log('Técnico: tecnico@helpdesk.com / tech123');
  console.log('Cliente: cliente@helpdesk.com / client123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
