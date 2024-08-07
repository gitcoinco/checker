"use client";
import Link from "next/link";
import { DiscoverRounds } from "@allo-team/kit";

export default function MyRoundsPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">My Rounds</h1>
      <DiscoverRounds
        query={{
          where: {
            // Only rounds where we are admin or manager
            roles: {
              some: {
                // This will be replaced with connected wallet address
                address: { in: ["0xb425ec6d420732053fdec999f8e9738cf75efdbd"] },
              },
            },
          },
        }}
        renderItem={(round, Component) => (
          <Link href={`/${round.chainId}/${round.id}`} key={round.id}>
            <Component {...round} />
          </Link>
        )}
        columns={[1, 2, 3]}
      />
    </div>
  );
}
