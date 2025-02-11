import { QueryResponseCache } from "relay-runtime";

export type QueryCacheProps = { size: number; ttl: number };

export class QueryCache extends QueryResponseCache {
  private static instance: QueryCache | null = null;

  public static getInstance(props = { size: 100, ttl: 5000 }) {
    if (!QueryCache.instance) {
      QueryCache.instance = new QueryCache(props);
    }

    return QueryCache.instance;
  }
}
