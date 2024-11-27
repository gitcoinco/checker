interface RouteCardProps {
  path: string;
  exampleLink: string;
  description: string;
}

export function RouteCard({ path, description, exampleLink }: RouteCardProps) {
  return (
    <div className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
      <div className="flex items-center justify-between">
        <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
          {path}
        </code>
        <a href={exampleLink}>example</a>
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      )}
    </div>
  );
}