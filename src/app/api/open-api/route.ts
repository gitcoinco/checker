import { generateOpenApi } from "@ts-rest/open-api";
import { contract } from "~/routes/contract";

const openApiDocument = generateOpenApi(contract, {
  info: { title: "Checker API", version: "1.0.0" },
});

export async function GET() {
  return Response.json(openApiDocument);
}
