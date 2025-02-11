import type { MutationParameters, SelectorStoreUpdater } from "relay-runtime";
import { useMutation, type GraphQLTaggedNode } from "react-relay/hooks";
import { useCallback } from "react";

export type StoreUpdater<T extends MutationParameters> = SelectorStoreUpdater<T["response"]>;

export const useAsyncMutation = <T extends MutationParameters>(
  mutation: GraphQLTaggedNode,
  updater?: StoreUpdater<T>
): [update: (v: T["variables"]) => Promise<T["response"]>, isLoading: boolean] => {
  const [commit, loading] = useMutation<T>(mutation);

  const submit = useCallback(
    (variables: T["variables"]) => {
      return new Promise<T["response"]>((resolve, reject) => {
        return commit({
          variables,
          onCompleted: (response) => resolve(response),
          onError: (error) => reject(error),
          updater,
        });
      });
    },
    [commit, updater]
  );

  return [submit, loading];
};
