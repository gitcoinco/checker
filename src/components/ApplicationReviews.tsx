"use client";
import { api } from "~/utils/api";

export function ApplicationReviews({
  chainId,
  roundId,
  applicationId,
}: {
  chainId: string;
  roundId: string;
  applicationId: string;
}) {
  const params = { chainId, roundId, applicationId };

  const reviews = api.reviews.queryReviews.useQuery(["reviews", params], {
    query: params,
  });

  if (!reviews.isPending && !reviews.data?.body) {
    return <div>no reviews yet</div>;
  }

  return (
    <div className="space-y-6">
      {reviews.data?.body?.map((review) => (
        <div key={review.id} className="rounded border p-4">
          <h5 className="text-lg font-semibold">Reviewed by: {review.model}</h5>
          <h5 className="text-sm font-semibold">Comment</h5>
          <div className="mb-4">{review.comment}</div>
          <div className="space-y-4">
            {review.evaluations.map((evaluation, i) => (
              <div key={i} className="space-y-2 rounded border p-4">
                <div className="flex gap-2 font-semibold">
                  <div>{evaluation.requirement}</div>
                </div>
                <h5 className="text-sm font-semibold">Reason</h5>
                <div>{evaluation.reason}</div>
                <h5 className="text-sm font-semibold">Score</h5>
                <div>{evaluation.score} / 10</div>
                <h5 className="text-sm font-semibold">References</h5>
                <div className="rounded bg-gray-900 p-2 text-gray-100">
                  <blockquote className="italic">
                    {evaluation.references}
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
