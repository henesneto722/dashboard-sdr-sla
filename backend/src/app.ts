/**
 * Aplicação Express - Backend de Monitoramento de SLA
 * 
 * Este servidor fornece:
 * - API REST para o Dashboard Frontend
 * - Webhooks para integração com Pipedrive
 * - Conexão com Supabase para persistência
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
import metricsRoutes from './routes/metricsRoutes.js';
import leadsRoutes from './routes/leadsRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

// Importar configuração do banco
import { testConnection } from './config/database.js';

// Criar aplicação Express
const app: Express = express();
const PORT = process.env.PORT || 3001;

// ============================================
// Middlewares
// ============================================

// CORS - Permitir requisições do frontend
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (ex: Postman, webhooks)
    if (!origin) return callback(null, true);
    // Permitir origens da lista ou qualquer subdomínio do Netlify/Vercel
    if (allowedOrigins.includes(origin) || 
        origin.endsWith('.netlify.app') || 
        origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(null, true); // Em produção, aceitar todas por enquanto
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parser JSON
app.use(express.json());

// Logger de requisições (desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// Rotas
// ============================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'lead-speed-monitor-backend',
  });
});

// API Routes
app.use('/api/metrics', metricsRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/webhook', webhookRoutes);

// Rota raiz
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Lead Speed Monitor - Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      metrics: {
        general: 'GET /api/metrics/general',
        ranking: 'GET /api/metrics/ranking',
        timeline: 'GET /api/metrics/timeline',
        hourlyPerformance: 'GET /api/metrics/hourly-performance',
      },
      leads: {
        slowest: 'GET /api/leads/slowest',
        pending: 'GET /api/leads/pending',
        detail: 'GET /api/leads/detail',
        sdrs: 'GET /api/leads/sdrs',
        byId: 'GET /api/leads/:lead_id',
      },
      webhooks: {
        pipedrive: 'POST /api/webhook/pipedrive',
        manualLead: 'POST /api/webhook/manual/lead',
        manualAttend: 'POST /api/webhook/manual/attend',
      },
    },
    documentation: 'https://github.com/seu-repo/lead-speed-monitor',
  });
});

// ============================================
// Tratamento de Erros
// ============================================

// 404 - Rota não encontrada
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// Error handler global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Inicialização do Servidor
// ============================================

async function startServer() {
  console.log('\n🚀 Iniciando Lead Speed Monitor Backend...\n');

  // Testar conexão com Supabase
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.warn('⚠️  Aviso: Não foi possível conectar ao Supabase.');
    console.warn('   Certifique-se de configurar o arquivo .env corretamente.');
    console.warn('   O servidor iniciará, mas as funcionalidades de banco não funcionarão.\n');
  }

  // Iniciar servidor
  app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  🖥️  Servidor rodando em: http://localhost:${PORT}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 Endpoints disponíveis:');
    console.log(`   GET  http://localhost:${PORT}/health`);
    console.log(`   GET  http://localhost:${PORT}/api/metrics/general`);
    console.log(`   GET  http://localhost:${PORT}/api/metrics/ranking`);
    console.log(`   GET  http://localhost:${PORT}/api/metrics/timeline`);
    console.log(`   GET  http://localhost:${PORT}/api/metrics/hourly-performance`);
    console.log(`   GET  http://localhost:${PORT}/api/leads/slowest`);
    console.log(`   GET  http://localhost:${PORT}/api/leads/pending`);
    console.log(`   GET  http://localhost:${PORT}/api/leads/detail`);
    console.log(`   POST http://localhost:${PORT}/api/webhook/pipedrive`);
    console.log('\n✅ Backend pronto para receber requisições!\n');
  });
}

// Executar
startServer().catch(console.error);

export default app;

