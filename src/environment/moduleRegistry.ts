export type PendingLoader<T> = {
  kind: "pending";
  resolve: (module: T | PromiseLike<T>) => void;
  reject: (error: Error) => void;
};

export type RegisteredLoader<T> = {
  kind: "registered";
  load: () => Promise<T>;
};

export type ModuleLoader<T> = PendingLoader<T> | RegisteredLoader<T>;

export class ModuleRegistry<T> {
  private static instance: ModuleRegistry<unknown>;

  private loaders: Map<string, ModuleLoader<T>>;
  private loaded: Map<string, T>;
  private pending: Map<string, Promise<unknown>>;
  private failed: Map<string, Error>;

  constructor() {
    this.loaders = new Map();
    this.loaded = new Map();
    this.pending = new Map();
    this.failed = new Map();
  }

  public get(name: string) {
    return this.loaded.get(name) ?? undefined;
  }

  public async load(name: string) {
    const loader = this.loaders.get(name);

    if (!loader) {
      const promise = new Promise<T>((resolve, reject) => {
        this.loaders.set(name, {
          kind: "pending",
          resolve,
          reject,
        });
      });

      this.pending.set(name, promise);
      return promise;
    }

    if (loader.kind === "registered") {
      try {
        const module = await loader.load();
        this.loaded.set(name, module);

        return module;
      } catch (error) {
        this.failed.set(name, error as Error);
        throw error;
      }
    }

    return null;
  }

  public register(name: string, load: () => Promise<T>) {
    const loader = this.loaders.get(name);

    if (!loader) {
      this.loaders.set(name, { kind: "registered", load });
      return;
    }

    if (loader.kind === "pending") {
      load()
        .then((module) => {
          this.loaded.set(name, module);
          this.pending.delete(name);
          loader.resolve(module);
        })
        .catch((error) => {
          this.failed.set(name, error);
          this.pending.delete(name);
          loader.reject(error);
        });
    }
  }

  public getError(name: string) {
    return this.failed.get(name);
  }

  public reset(name: string) {
    return this.failed.delete(name);
  }

  public static getInstance<T>() {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }

    return ModuleRegistry.instance as ModuleRegistry<T>;
  }
}
