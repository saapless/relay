import type {
  CacheConfig,
  ConcreteRequest,
  Environment,
  OperationType,
  GraphQLResponse,
  RequestParameters,
} from "relay-runtime";

export type QueryResponse<T extends OperationType> = {
  variables: T["variables"];
  params: RequestParameters;
  rawResponse: GraphQLResponse;
};

export async function fetchServerQuery<T extends OperationType>(
  environment: Environment,
  request: ConcreteRequest,
  variables: T["variables"] = {},
  cacheConfig?: CacheConfig
): Promise<QueryResponse<T>> {
  const response = await environment
    .getNetwork()
    .execute(request.params, variables, cacheConfig ?? {})
    .toPromise();

  if (!response) {
    throw new Error("No response received from the server.");
  }

  return {
    variables: variables,
    params: request.params,
    rawResponse: response,
  };
}
