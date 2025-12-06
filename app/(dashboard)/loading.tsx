import { LoadingSpinner } from "@/components/loading-spinner"

export default function DashboardLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}
