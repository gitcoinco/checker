import { initQueryClient } from "@ts-rest/react-query";
import { contract } from "~/routes/contract";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const api = initQueryClient(contract, {
  baseUrl: `${getBaseUrl()}/api/`,
  baseHeaders: {},
});
