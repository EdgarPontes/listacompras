#!/usr/bin/env node

/**
 * Script utilitário para configuração inicial das variáveis de ambiente
 * Uso: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function generateJwtSecret() {
  return require('crypto').randomBytes(32).toString('hex');
}

async function setupBackendEnv() {
  const backendEnvPath = path.join(__dirname, '..', 'backend', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');

  console.log('\n🔧 Configurando variáveis de ambiente do Backend...\n');

  try {
    // Verificar se .env.example existe
    if (!fs.existsSync(envExamplePath)) {
      console.error('❌ Arquivo .env.example não encontrado!');
      return;
    }

    // Ler template
    let envContent = fs.readFileSync(envExamplePath, 'utf8');

    // Perguntar configurações
    const databaseUrl = await askQuestion('DATABASE_URL (postgresql://user:pass@host:port/db?schema=public): ');
    const port = await askQuestion('PORT (3001): ');
    const jwtSecret = await askQuestion('JWT_SECRET (deixe vazio para gerar automaticamente): ');

    // Substituir valores
    envContent = envContent.replace(
      /DATABASE_URL=".*"/,
      `DATABASE_URL="${databaseUrl || 'postgresql://user:password@localhost:5432/smart_shopping_list?schema=public'}"`
    );

    envContent = envContent.replace(
      /PORT=3001/,
      `PORT=${port || 3001}`
    );

    const finalJwtSecret = jwtSecret || generateJwtSecret();
    envContent = envContent.replace(
      /JWT_SECRET=".*"/,
      `JWT_SECRET="${finalJwtSecret}"`
    );

    // Escrever arquivo .env
    fs.writeFileSync(backendEnvPath, envContent);
    console.log('✅ Arquivo backend/.env criado com sucesso!');

    // Tornar executável (Unix-like systems)
    try {
      fs.chmodSync(backendEnvPath, '0600');
      console.log('🔒 Permissões do arquivo .env configuradas para 0600 (apenas owner pode ler)');
    } catch (error) {
      console.log('⚠️  Não foi possível configurar permissões do arquivo .env');
    }

  } catch (error) {
    console.error('❌ Erro ao configurar backend:', error.message);
  }
}

async function setupFrontendEnv() {
  const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env.local');

  console.log('\n🌐 Configurando variáveis de ambiente do Frontend...\n');

  try {
    const backendUrl = await askQuestion('NEXT_PUBLIC_BACKEND_URL (http://localhost:3001): ');

    const envContent = `NEXT_PUBLIC_BACKEND_URL=${backendUrl || 'http://localhost:3001'}

# Frontend Environment Variables
# NEXT_PUBLIC_BACKEND_URL: URL base da API do backend
`;

    fs.writeFileSync(frontendEnvPath, envContent);
    console.log('✅ Arquivo frontend/.env.local criado com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao configurar frontend:', error.message);
  }
}

async function main() {
  console.log('🚀 Smart Shopping List - Configuração das Variáveis de Ambiente');
  console.log('=============================================================\n');

  console.log('Este script irá ajudá-lo a configurar as variáveis de ambiente');
  console.log('necessárias para o projeto funcionar corretamente.\n');

  console.log('📋 Certifique-se de ter:');
  console.log('   - PostgreSQL instalado e rodando');
  console.log('   - Node.js v18+ instalado');
  console.log('   - Acesso às credenciais do banco de dados\n');

  const confirm = await askQuestion('Deseja continuar? (s/n): ');

  if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'sim') {
    console.log('❌ Configuração cancelada pelo usuário');
    rl.close();
    return;
  }

  await setupBackendEnv();
  await setupFrontendEnv();

  console.log('\n🎉 Configuração concluída!');
  console.log('\n📖 Próximos passos:');
  console.log('   1. Backend: cd backend && npm install && npx prisma generate && npx prisma migrate dev');
  console.log('   2. Frontend: cd frontend && npm install && npm run dev');
  console.log('   3. Abra http://localhost:3000 no navegador');
  console.log('\n📚 Consulte ENVIRONMENT_VARIABLES.md para mais detalhes');

  rl.close();
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setupBackendEnv, setupFrontendEnv };
