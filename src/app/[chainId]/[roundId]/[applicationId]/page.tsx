"use client";
import {
  ApplicationAnswers,
  ApplicationDetails,
  BackButton,
  Button,
} from "@allo-team/kit";
import { useQueryClient } from "@ts-rest/react-query/tanstack";
import Link from "next/link";
import { ApplicationReviews } from "~/components/ApplicationReviews";
import { api } from "~/utils/api";

export default function ApplicationPage({
  params,
}: {
  params: {
    chainId: string;
    roundId: string;
    applicationId: string;
  };
}) {
  const { chainId, roundId, applicationId } = params;
  const queryClient = useQueryClient();
  const review = api.reviews.reviewApplication.useMutation({
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["reviews", params] }),
  });
  return (
    <div>
      <ApplicationDetails
        backAction={
          <Link href={`/${chainId}/${roundId}`}>
            <BackButton />
          </Link>
        }
        primaryAction={
          <Button
            isLoading={review.isPending}
            onClick={() =>
              review.mutate({
                body: null, // We can add a manual review here
                params,
              })
            }
          >
            {review.isPending ? "Reviewing..." : "Review Application"}
          </Button>
        }
        id={applicationId}
        chainId={Number(chainId)}
        roundId={roundId}
      />
      <h3 className="mb-2 mt-8 text-xl font-semibold">Reviews</h3>
      <ApplicationReviews {...params} />
      <h3 className="mb-2 mt-8 text-xl font-semibold">Application Answers</h3>
      <ApplicationAnswers
        applicationId={applicationId}
        chainId={Number(chainId)}
        roundId={roundId}
      />
    </div>
  );
}
