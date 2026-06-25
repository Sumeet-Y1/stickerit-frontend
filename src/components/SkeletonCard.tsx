export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[2rem] border-[3px] border-black bg-white shadow-[8px_8px_0_#111]">
      <div className="h-64 animate-pulse bg-[#ffd044]" />
      <div className="space-y-3 p-4">
        <div className="h-6 w-2/3 animate-pulse rounded-full bg-[#ef84d8]" />
        <div className="h-4 w-full animate-pulse rounded-full bg-black/15" />
        <div className="h-4 w-5/6 animate-pulse rounded-full bg-black/15" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-16 animate-pulse rounded-full bg-[#78e5bd]" />
          <div className="h-8 w-20 animate-pulse rounded-full bg-[#8eb9ff]" />
          <div className="h-8 w-14 animate-pulse rounded-full bg-[#ffd044]" />
        </div>
      </div>
    </div>
  );
}
