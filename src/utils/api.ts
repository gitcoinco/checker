import { initQueryClient } from "@ts-rest/react-query";
import { contract } from "~/routes/contract";

export const api = initQueryClient(contract, {
  baseUrl: "http://localhost:3000/api/",
  baseHeaders: {},
});
