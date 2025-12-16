import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'

/**
 * Dashboard Skeleton (Member View)
 * Header + Company Card + 4 Stats Grid + Activity Card
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 pt-0.5">
      {/* Header - matches: h2 text-4xl (36px) + p text-lg mt-2 (28px) */}
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-7 w-72" />
      </div>

      {/* Company Overview */}
      <div className="space-y-6">
        {/* Company Header Card */}
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <div>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="mt-1 h-5 w-52" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 4 Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              className="group"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="mt-1 h-4 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="mt-1 h-5 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-border/40 flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="mt-1 h-4 w-24" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Team Members Skeleton
 * Header (with 2 buttons) + Members Card
 */
export function TeamMembersSkeleton() {
  return (
    <div className="space-y-8 pt-0.5">
      {/* Header with buttons */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-24" />
          <Skeleton className="mt-2 h-7 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Members Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-1 h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-border flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="mt-1 h-4 w-44" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Invites Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-1 h-5 w-56" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="mx-auto h-5 w-44" />
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Queue Skeleton
 * Header (with button) + Queue Card with 3 sub-cards
 */
export function QueueSkeleton() {
  return (
    <div className="space-y-8 pt-0.5">
      {/* Header with button */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-14" />
          <Skeleton className="mt-2 h-7 w-64" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Queue Card */}
      <Card className="group">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="mt-1 h-5 w-40" />
            </div>
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="border-border"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-5" />
                  </div>
                  <Skeleton className="mt-1 h-4 w-44" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Profile Skeleton
 * Header + Profile Card with avatar, email, name fields
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-8 pt-0.5">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-16" />
        <Skeleton className="mt-2 h-7 w-72" />
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-1 h-5 w-56" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-1 h-4 w-48" />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-4 w-72" />
          </div>

          {/* Name field */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-11 w-full" />
          </div>

          {/* Button */}
          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>
    </div>
  )
}
