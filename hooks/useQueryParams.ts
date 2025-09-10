import { useRouter } from "next/router";
import { NextRouter } from "next/router";

type GetQueryParamProps = {
  value: string | string[] | undefined;
  defaultValue?: string;
};

type UseQueryParamsProps = {
  defaults?: Record<string, string>;
  ready?: boolean;
};

type SetQueryParamsProps = {
  router: NextRouter;
  params: Record<string, string | null | undefined>;
  options?: { shallow?: boolean; replace?: boolean };
};

type UseQueryParamProps = {
  key: string;
  defaultValue?: string;
  ready?: boolean;
};

// Safely gets a string value from Next.js query params
// Handles both string and string[] cases, returns first value if array
export const getQueryParam = ({ value, defaultValue }: GetQueryParamProps) => {
  if (Array.isArray(value)) {
    return value[0] || defaultValue || "";
  }
  return value || defaultValue || "";
};

// Set query parameters (single or multiple)
export const setQueryParams = async ({
  router,
  params,
  options = {},
}: SetQueryParamsProps) => {
  const { shallow = true, replace = true } = options;
  const currentQuery = { ...router.query };

  // Apply updates
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      delete currentQuery[key];
    } else {
      currentQuery[key] = value;
    }
  });

  const method = replace ? router.replace : router.push;

  await method(
    {
      pathname: router.pathname,
      query: currentQuery,
    },
    undefined,
    { shallow }
  );
};

// Custom hook for managing query parameters with defaults
export const useQueryParams = (options: UseQueryParamsProps = {}) => {
  const { defaults = {}, ready = true } = options;
  const router = useRouter();

  // Get current query parameters with defaults applied
  const getParams = () => {
    if (!ready) return defaults;

    const result: Record<string, string> = {};
    const allKeys = new Set([
      ...Object.keys(router.query),
      ...Object.keys(defaults),
    ]);

    allKeys.forEach((keyName) => {
      result[keyName] = getQueryParam({
        value: router.query[keyName],
        defaultValue: defaults[keyName],
      });
    });

    return result;
  };

  const queryParams = getParams();

  // Actions for updating query parameters
  const setParam = async (
    paramKey: string,
    value: string | null | undefined
  ) => {
    if (!ready) return;
    await setQueryParams({ router, params: { [paramKey]: value } });
  };

  const setParams = async (
    params: Record<string, string | null | undefined>
  ) => {
    if (!ready) return;
    await setQueryParams({ router, params });
  };

  const removeParam = async (paramKey: string | string[]) => {
    if (!ready) return;
    const keysArray = Array.isArray(paramKey) ? paramKey : [paramKey];
    const updates = keysArray.reduce((acc, k) => {
      acc[k] = null;
      return acc;
    }, {} as Record<string, null>);

    await setQueryParams({ router, params: updates });
  };

  return [queryParams, { setParam, setParams, removeParam }] as const;
};

// Simplified hook for a single query parameter
export const useQueryParam = ({
  key,
  defaultValue = "",
  ready = true,
}: UseQueryParamProps) => {
  const [params, { setParam }] = useQueryParams({
    defaults: { [key]: defaultValue },
    ready,
  });

  const setValue = async (value: string | null | undefined) => {
    await setParam(key, value);
  };

  return [params[key], setValue] as const;
};
