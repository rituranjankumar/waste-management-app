export default function Skeleton() {
  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-4 w-2/3 bg-gray-200 dark:bg-zinc-800 rounded" />
      <div className="h-4 w-full bg-gray-200 dark:bg-zinc-800 rounded" />
      <div className="h-4 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded" />
      <div className="h-40 w-full bg-gray-200 dark:bg-zinc-800 rounded-xl" />
    </div>
  );
}
