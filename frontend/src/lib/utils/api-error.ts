type GenericObject = Record<string, any>;

const coerceString = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return null;
};

const readGraphqlErrorMessage = (errorLike: GenericObject): string | null => {
  const graphQLErrors = errorLike?.graphQLErrors;
  if (Array.isArray(graphQLErrors) && graphQLErrors.length > 0) {
    const first = graphQLErrors[0] as GenericObject;
    return (
      coerceString(first?.extensions?.originalError?.message) ||
      coerceString(first?.extensions?.message) ||
      coerceString(first?.message) ||
      null
    );
  }

  const networkErrors = errorLike?.networkError?.result?.errors;
  if (Array.isArray(networkErrors) && networkErrors.length > 0) {
    const first = networkErrors[0] as GenericObject;
    return coerceString(first?.message) || null;
  }

  return null;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  if (!error) return fallback;

  const err = error as GenericObject;
  const fromGraphql = readGraphqlErrorMessage(err);
  if (fromGraphql) return fromGraphql;

  const responseData = err?.response?.data as GenericObject | undefined;
  if (responseData) {
    const nestedValidation = Array.isArray(responseData.errors) ? responseData.errors : [];
    const validationMessage = nestedValidation
      .map((item: any) => item?.message || item?.defaultMessage || item?.error)
      .find((msg: unknown) => coerceString(msg));

    return (
      coerceString(responseData.message) ||
      coerceString(responseData.error) ||
      coerceString(responseData.details?.message) ||
      coerceString(validationMessage) ||
      coerceString(err?.message) ||
      fallback
    );
  }

  return coerceString(err?.message) || fallback;
};

