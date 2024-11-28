interface RouteCardProps {
  path: string;
  exampleLink: string;
  description: string;
}

export function RouteCard({ path, description, exampleLink }: RouteCardProps) {
  return (
    <div className="group rounded-lg border border-gray-200 p-4 transition-all hover:border-gray-300">
      <div className="flex items-center justify-between">
        <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800">
          {path}
        </code>
        <a href={exampleLink}>example</a>
      </div>
      {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
    </div>
  );
}
