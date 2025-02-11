"use client";

import type { GraphQLResponse, OperationType, RequestParameters } from "relay-runtime";
import type { PreloadedQuery, PreloadFetchPolicy } from "react-relay/hooks";
import { useRelayEnvironment } from "react-relay/hooks";
import { useMemo } from "react";
import { QueryCache } from "../environment";

export type SerializedQueryResponse<T extends OperationType> = {
  variables: T["variables"];
  params: RequestParameters;
  rawResponse: GraphQLResponse;
};

export const useQueryResponse = <T extends OperationType>(
  operation: SerializedQueryResponse<T>,
  fetchPolicy: PreloadFetchPolicy = "store-or-network"
): PreloadedQuery<T> => {
  const environment = useRelayEnvironment();

  useMemo(() => {
    const cacheKey = operation.params.id ?? operation.params.cacheID;
    QueryCache.getInstance().set(cacheKey, operation.variables, operation.rawResponse);
  }, [operation]);

  return {
    environment,
    fetchKey: operation.params.id ?? operation.params.cacheID,
    fetchPolicy,
    isDisposed: false,
    name: operation.params.name,
    kind: "PreloadedQuery",
    variables: operation.variables,
    dispose: () => {},
  };
};
