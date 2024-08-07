"use client";

import {
  ApplicationStatusBadge,
  BackButton,
  RoundDetailsWithHook,
  useApplications,
} from "@allo-team/kit";
import Link from "next/link";
import { useMemo } from "react";
import type { ReviewWithEvaluations } from "~/routes/review/review.contract";
import { api } from "~/utils/api";

/*

Show Round Details using the AlloKit component
Fetch Applications with AlloKit useApplications hook
Fetch Reviews for round
Render Applications with reviews info (score + # reviews)

*/

export default function RoundPage({
  params,
}: {
  params: {
    chainId: string;
    roundId: string;
  };
}) {
  const { chainId, roundId } = params;

  // Query applications
  const applications = useApplications({
    where: {
      chainId: { equalTo: Number(chainId) },
      roundId: { equalTo: roundId },
    },
  });
  // Query reviews
  const reviews = api.reviews.queryReviews.useQuery(["reviews", params], {
    query: params,
  });

  // Group reviews by applicationId
  const reviewByApplicationId = useMemo(
    () =>
      (reviews.data?.body ?? []).reduce(
        (reviews, review) => ({
          ...reviews,
          [review.applicationId]: (reviews[review.applicationId] ?? []).concat(
            review,
          ),
        }),
        {} as Record<string, ReviewWithEvaluations[]>,
      ),
    [reviews],
  );

  return (
    <div>
      <RoundDetailsWithHook
        backAction={
          <Link href={"/"}>
            <BackButton />
          </Link>
        }
        chainId={Number(chainId)}
        roundId={roundId}
      />
      <div className="space-y-2">
        {applications.data?.map((application) => {
          const reviews = reviewByApplicationId[application.id] ?? [];
          const aggregatedScore = reviews.reduce(
            (sum, x) =>
              sum + x.evaluations.reduce((_sum, y) => _sum + y.score, 0),
            0,
          );
          return (
            <Link
              key={application.id}
              className="flex items-center justify-between gap-2 rounded border p-2 hover:bg-gray-50"
              href={`/${chainId}/${roundId}/${application.id}`}
            >
              <div className="flex-1 truncate font-semibold">
                {application.name}
              </div>
              <ApplicationStatusBadge status={application.status} />
              <div className="flex-shrink-0 text-center text-sm">
                <div className="">
                  Score: {reviews.length ? aggregatedScore / reviews.length : 0}
                </div>
                <div className="">{reviews.length} reviews</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
