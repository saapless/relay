import type {
  GraphQLResponse,
  GraphQLResponseWithExtensionsOnly,
  PayloadExtensions,
  UploadableMap,
} from "relay-runtime/lib/network/RelayNetworkTypes";
import {
  Network,
  type CacheConfig,
  type RequestParameters,
  type SubscribeFunction,
  type Variables,
} from "relay-runtime";
import { IS_SERVER } from "../utils";
import { ModuleRegistry } from "./moduleRegistry";
import { QueryCache, type QueryCacheProps } from "./cache";

export type LoaderConfig = {
  url: string;
  headers?: () => Promise<Record<string, string>>;
};

export type ExtensionsHandler = (
  extensions: PayloadExtensions,
  moduleRegistry: ModuleRegistry<unknown>
) => void;

export type NetworkConfig = {
  loader: FetchFunction | LoaderConfig;
  subscriber?: SubscribeFunction;
  queryCache?: QueryCacheProps;
  extensionsHandler?: ExtensionsHandler;
};

export type FetchFunction = (
  request: RequestParameters,
  variables: Variables,
  cacheConfig: CacheConfig,
  uploadables?: UploadableMap | null
) => Promise<GraphQLResponse>;

function getLoader(config: FetchFunction | LoaderConfig): FetchFunction {
  if (typeof config === "function") {
    return config;
  }

  return async function loader(operation, variables) {
    const headers = new Headers({
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip",
    });

    if (typeof config.headers === "function") {
      const customHeaders = await config.headers();
      Object.entries(customHeaders).forEach(([name, value]) => headers.set(name, value));
    }

    const response = await fetch(config.url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        operationKind: operation.operationKind,
        name: operation.name,
        id: operation.id ?? undefined,
        query: operation.text ?? undefined,
        variables,
      }),
    });

    return response.json();
  };
}

function hasExtension(response: GraphQLResponse): response is GraphQLResponseWithExtensionsOnly {
  return Object.hasOwn(response, "extensions");
}

function createFetcher(config: NetworkConfig): FetchFunction {
  return async function fetcher(...args) {
    const [operation, variables, cacheConfig] = args;

    let response: GraphQLResponse | undefined = undefined;

    if (!IS_SERVER && operation.operationKind === "query" && !cacheConfig.force) {
      const cache = QueryCache.getInstance(config.queryCache);
      const cachedResponse = cache.get(operation.id ?? operation.cacheID, variables);

      if (cachedResponse) {
        response = cachedResponse;
      }
    }

    if (!response) {
      const loader = getLoader(config.loader);
      response = await loader(...args);
    }

    if (config.extensionsHandler && hasExtension(response)) {
      config.extensionsHandler(response.extensions, ModuleRegistry.getInstance());
    }

    return response;
  };
}

export function createNetwork(config: NetworkConfig) {
  return Network.create(createFetcher(config), config.subscriber);
}
