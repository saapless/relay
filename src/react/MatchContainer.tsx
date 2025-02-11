import { useCallback, type ComponentType, type FC } from "react";
import {
  MatchContainer as RelayMatchContainer,
  type MatchContainerProps as RelayMatchContainerProps,
} from "react-relay/relay-hooks/MatchContainer";
import { ModuleRegistry } from "../environment/moduleRegistry";

type MatchContainerProps = Omit<RelayMatchContainerProps, "loader">;

const MatchContainer: FC<MatchContainerProps> = (props) => {
  const load: RelayMatchContainerProps["loader"] = useCallback((moduleName) => {
    const registry = ModuleRegistry.getInstance<ComponentType<Record<string, unknown>>>();
    const error = registry.getError(moduleName as string);

    if (error) {
      throw error;
    }

    const module = registry.get(moduleName as string);

    if (module) {
      return module;
    }

    throw registry.load(moduleName as string);
  }, []);

  // @ts-expect-error - Types seems to be wrong for this.
  return <RelayMatchContainer loader={load} {...props} />;
};

export default MatchContainer;
