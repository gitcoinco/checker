import { RouteCard } from "@/components";

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-12 flex items-center gap-4">
          <h1 className="text-3xl text-gray-900">Checker</h1>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Available Routes</h2>
            <div className="space-y-3">
              <RouteCard
                path="/review/[chain-id]/[pool-id]"
                exampleLink="/review/42161/609"
                description="Review details for a specific pool on a given chain"
              />
              <RouteCard
                path="/view/application/[chain-id]/[pool-id]/[application-id]"
                exampleLink="/view/application/42161/609/0"
                description="View application details for a specific pool and chain"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500">
            Use the routes above to navigate through different sections of the application. Replace
            the bracketed parameters with actual values.
          </p>
        </div>
      </div>
    </div>
  );
};
