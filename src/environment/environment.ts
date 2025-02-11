import {
  Environment,
  RecordSource,
  Store,
  type LogFunction,
  type MissingFieldHandler,
  type NormalizationSplitOperation,
  type OperationLoader,
} from "relay-runtime";
import { IS_SERVER } from "../utils";
import { createNetwork, type NetworkConfig } from "./network";
import { ModuleRegistry } from "./moduleRegistry";

export type RelayEnvironmentConfig = NetworkConfig & {
  missingFieldHandlers?: MissingFieldHandler[];
  logger?: LogFunction;
};

export class RelayEnvironment extends Environment {
  private static instance: RelayEnvironment | null = null;

  public static createInstance(config: RelayEnvironmentConfig) {
    const { missingFieldHandlers, logger, ...networkConfig } = config;
    const registry = ModuleRegistry.getInstance<NormalizationSplitOperation>();

    const operationLoader: OperationLoader = {
      get: (module) => registry.get(module as string),
      load: (reference) => registry.load(reference as string),
    };

    return new RelayEnvironment({
      network: createNetwork(networkConfig),
      store: new Store(new RecordSource(), { operationLoader }),
      operationLoader,
      missingFieldHandlers,
      log: logger,
      isServer: IS_SERVER,
    });
  }

  public static getInstance(config: RelayEnvironmentConfig) {
    if (!RelayEnvironment.instance) {
      RelayEnvironment.instance = RelayEnvironment.createInstance(config);
    }

    return RelayEnvironment.instance;
  }
}

export function createRelayEnvironment(config: RelayEnvironmentConfig) {
  if (IS_SERVER) {
    return RelayEnvironment.createInstance(config);
  }

  return RelayEnvironment.getInstance(config);
}
