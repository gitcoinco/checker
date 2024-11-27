import Review from "@/app/review/[id]/review";

export default async function InitChecker({ params }: { params: { id: string } }) {
  const id = (params).id;
  const [chainId, poolId] = id.split("-");

  if (!chainId || !poolId) {
    return <div>Invalid pool ID</div>;
  }
  return <Review chainId={parseInt(chainId, 10)} poolId={poolId} />;
}
