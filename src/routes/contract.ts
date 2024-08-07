import { initContract } from "@ts-rest/core";

import { reviewContract } from "./review/review.contract";

const c = initContract();

export const contract = c.router({
  reviews: reviewContract,
});
