import { prisma } from '../src/config/database';

beforeAll(async () => {
  // Configuração antes de todos os testes
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Silencia os logs durante os testes
console.log = jest.fn();
console.error = jest.fn();
