"use client";

import dynamic from "next/dynamic";

const ApplicationView = dynamic(() => import("gitcoin-ui").then(mod => mod.ApplicationView), {
  ssr: false,
});
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = (await params).id;

  const [chainId, poolId, applicationId] = id.split("-");

  if (!chainId || !poolId || !applicationId) {
    return <div>Invalid application ID</div>;
  }

  return (
    <div>
      <ApplicationView
        applicationId={applicationId}
        chainId={parseInt(chainId, 10)}
        poolId={poolId}
      />
    </div>
  );
}
