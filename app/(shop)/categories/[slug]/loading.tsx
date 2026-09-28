import {
  Skeleton,
  SkeletonPageHeader,
  SkeletonProductGrid,
} from "@/components/ui/Skeletons";

export default function CategoryDetailLoading() {
  return (
    <div className="space-y-10">
      <SkeletonPageHeader />
      <Skeleton className="h-8 w-48" />
      <SkeletonProductGrid count={6} />
    </div>
  );
}
