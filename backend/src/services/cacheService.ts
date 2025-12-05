/**
 * Serviço de Cache em Memória
 * Para métricas frequentemente acessadas
 * 
 * Nota: Em produção com múltiplas instâncias, usar Redis
 */

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  /**
   * Busca valor do cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  /**
   * Salva valor no cache
   * @param key Chave do cache
   * @param data Dados a serem cacheados
   * @param ttlSeconds Tempo de vida em segundos (default: 30s)
   */
  set<T>(key: string, data: T, ttlSeconds: number = 30): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      cachedAt: now,
      expiresAt: now + (ttlSeconds * 1000),
    });
  }
  
  /**
   * Invalida uma entrada do cache
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Invalida todas as entradas que começam com um prefixo
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Retorna estatísticas do cache
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Instância única do cache
export const cache = new MemoryCache();

// Chaves de cache padronizadas
export const CACHE_KEYS = {
  GENERAL_METRICS: 'metrics:general',
  SDR_RANKING: 'metrics:ranking',
  IMPORTANT_PENDING: 'leads:important-pending',
  UNIQUE_SDRS: 'leads:sdrs',
} as const;

// TTL padrão para cada tipo de cache (em segundos)
export const CACHE_TTL = {
  METRICS: 30,      // Métricas gerais: 30 segundos
  RANKING: 60,      // Ranking de SDRs: 1 minuto
  LEADS: 15,        // Lista de leads: 15 segundos
  SDRS: 300,        // Lista de SDRs: 5 minutos
} as const;

