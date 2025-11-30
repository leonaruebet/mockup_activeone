"use client";

import * as React from "react"
import { HardDrive, Database, Activity, Archive, AlertTriangle, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../molecules/card'
import { Grid } from '../../templates/grid'
import { Stack } from '../../templates/stack'
import { Container } from '../../templates/container'
import { Tag } from '../../atoms/tag'
import { Typography } from '../../atoms/typography'
import { Progress } from '../../atoms/progress_bar'
import { Skeleton } from '../../atoms/skeleton'
import { cn } from "../../utils"
import { useTranslations, useFormatter } from 'next-intl'

/**
 * Batch Data Display Component
 * Shows organization batch data statistics using existing shared components
 */

export interface BatchDataStatistics {
  total_batches: number
  active_batches: number
  completed_batches: number
  failed_batches: number
  total_sessions: number
  active_sessions: number
  completed_sessions: number
  failed_sessions: number
  total_data_points: number
  storage_used_mb: number
  storage_used_gb: number
  storage_usage_percentage: number
}

export interface OrganizationInfo {
  id: string
  org_id: string
  name: string
  tier: 'free' | 'pro' | 'plus' | 'enterprise'
  storage_limit_gb: number
  can_add_more: boolean
}

export interface RecentBatch {
  id: string
  name: string
  status: string
  type: string
  records: number
  sessions_count: number
  created_at: string
  updated_at: string
  completion_percentage: number
  has_full_data: boolean
}

interface BatchDataDisplayProps {
  statistics: BatchDataStatistics
  organization: OrganizationInfo
  recent_batches: RecentBatch[]
  storage_breakdown: {
    by_platform: Record<string, any>
    largest_batch: RecentBatch | null
    processing_status: {
      active: number
      completed: number
      failed: number
      mixed: number
    }
  }
  isLoading?: boolean
  className?: string
  showStatistics?: boolean
}

export function BatchDataDisplay({
  statistics,
  organization,
  recent_batches,
  storage_breakdown,
  isLoading = false,
  className,
  showStatistics = true
}: BatchDataDisplayProps) {
  const t = useTranslations('drive')
  const tCommon = useTranslations('common')
  const format = useFormatter()
  if (isLoading) {
    return (
      <Stack direction="column" spacing="lg" className={className}>
        <Grid cols={4} gap="md" className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    )
  }

  const tierVariants = {
    free: 'outline',
    pro: 'day-blue',
    plus: 'purple-blue', 
    enterprise: 'happy-orange'
  } as const

  const statusVariants = {
    active: 'day-blue',
    completed: 'stem-green',
    failed: 'red-power',
    mixed: 'sunglow',
    in_progress: 'day-blue',
    processing: 'day-blue',
    success: 'stem-green',
    error: 'red-power'
  } as const

  return (
    <Stack direction="column" spacing="lg" className={className}>

      {/* Statistics Cards - only show if showStatistics is true */}
      {showStatistics && (
        <Grid cols={4} gap="md" className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Batches */}
        <Card>
          <CardHeader>
            <Stack direction="row" justify="between" align="center" className="pb-3">
              <CardTitle className="text-sm font-medium">{t('metrics.totalBatches', { default: 'Total Batches' })}</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </Stack>
          </CardHeader>
          <CardContent>
            <Stack direction="column" spacing="xs">
              <div className="text-2xl font-bold">{statistics.total_batches}</div>
              <p className="text-xs text-muted-foreground">
                {t('metrics.summary', { default: '{active} active, {completed} completed', active: statistics.active_batches, completed: statistics.completed_batches })}
              </p>
            </Stack>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardHeader>
            <Stack direction="row" justify="between" align="center" className="pb-3">
              <CardTitle className="text-sm font-medium">{t('metrics.storageUsed', { default: 'Storage Used' })}</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </Stack>
          </CardHeader>
          <CardContent>
            <Stack direction="column" spacing="sm">
              <div className="text-2xl font-bold">{statistics.storage_used_gb}GB</div>
              <div>
                <Progress 
                  value={statistics.storage_usage_percentage} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('metrics.storagePercentOfLimit', { default: '{percent}% of {limitGb}GB limit', percent: statistics.storage_usage_percentage, limitGb: organization.storage_limit_gb })}
                </p>
              </div>
            </Stack>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <Stack direction="row" justify="between" align="center" className="pb-3">
              <CardTitle className="text-sm font-medium">{t('metrics.activeSessions', { default: 'Active Sessions' })}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </Stack>
          </CardHeader>
          <CardContent>
            <Stack direction="column" spacing="xs">
              <div className="text-2xl font-bold">{statistics.active_sessions}</div>
              <p className="text-xs text-muted-foreground">
                {t('metrics.totalSessions', { default: '{count} total sessions', count: statistics.total_sessions })}
              </p>
            </Stack>
          </CardContent>
        </Card>

        {/* Data Points */}
        <Card>
          <CardHeader>
            <Stack direction="row" justify="between" align="center" className="pb-3">
              <CardTitle className="text-sm font-medium">{t('metrics.dataPoints', { default: 'Data Points' })}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </Stack>
          </CardHeader>
          <CardContent>
            <Stack direction="column" spacing="xs">
              <div className="text-2xl font-bold">
                {statistics.total_data_points.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('metrics.acrossAllBatches', { default: 'Across all batches' })}
              </p>
            </Stack>
          </CardContent>
        </Card>
        </Grid>
      )}

      {/* Recent Batches */}
      <Card>
        <CardContent className="pt-6">
          {recent_batches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('emptyDescription', { default: 'No batch data available for this organization.' })}
            </div>
          ) : (
            <Stack direction="column" spacing="sm">
              {recent_batches.map((batch) => {
                console.log(`[${new Date().toISOString()}] BatchDataDisplay - rendering batch:`, { id: batch.id, name: batch.name, status: batch.status });
                return (
                <div
                  key={batch.id}
                  className="p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <Stack direction="row" justify="between" align="center">
                    <div className="flex-1">
                      <Stack direction="column" spacing="xs">
                        <Typography variant="body" className="font-medium">
                          {batch.name}
                        </Typography>
                        <Stack direction="row" align="center" spacing="md" className="text-sm text-muted-foreground">
                          <span>{t('recent.records', { default: '{count} records', count: batch.records.toLocaleString() })}</span>
                          <span>{t('recent.sessions', { default: '{count} sessions', count: batch.sessions_count })}</span>
                          <Stack direction="row" align="center" spacing="xs">
                            <Clock className="h-3 w-3" />
                            <span>{format.dateTime(new Date(batch.updated_at), { dateStyle: 'medium' })}</span>
                          </Stack>
                        </Stack>
                      </Stack>
                    </div>
                    <Tag 
                      variant={statusVariants[batch.status as keyof typeof statusVariants] || statusVariants.mixed}
                    >
                      {batch.status}
                    </Tag>
                  </Stack>
                </div>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Storage Breakdown section removed as requested */}
    </Stack>
  )
}
