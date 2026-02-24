'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Download, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getSalesReport, getRevenueReport, getClaimsReport,
  getUserGrowthReport, exportReport, type ReportData
} from '@/lib/api/admin'
import { getErrorMessage } from '@/lib/api/errors'

function StatCard({ title, value, sub }: { title: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function GrowthBadge({ growth }: { growth?: number }) {
  if (growth === undefined) return null
  const positive = growth >= 0
  return (
    <span className={`flex items-center gap-1 text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? '+' : ''}{growth.toFixed(1)}% from last period
    </span>
  )
}

function BreakdownTable({ rows, col1, col2 }: {
  rows: Array<Record<string, string | number>>
  col1: string
  col2: string
}) {
  if (!rows || rows.length === 0) return <p className="text-sm text-muted-foreground">No breakdown data available</p>
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="text-left py-2 font-medium">{col1}</th>
          <th className="text-right py-2 font-medium">{col2}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b last:border-0">
            <td className="py-2 capitalize">{String(Object.values(row)[0])}</td>
            <td className="py-2 text-right font-medium">{String(Object.values(row)[1])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function LoadingCard() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  )
}

export default function ReportsPage() {
  const [salesData, setSalesData] = useState<ReportData | null>(null)
  const [revenueData, setRevenueData] = useState<ReportData | null>(null)
  const [claimsData, setClaimsData] = useState<ReportData | null>(null)
  const [usersData, setUsersData] = useState<ReportData | null>(null)
  const [loadingTab, setLoadingTab] = useState<string | null>(null)
  const [exportingTab, setExportingTab] = useState<string | null>(null)

  const loadTab = async (tab: string) => {
    setLoadingTab(tab)
    try {
      if (tab === 'sales' && !salesData) {
        setSalesData(await getSalesReport())
      } else if (tab === 'revenue' && !revenueData) {
        setRevenueData(await getRevenueReport())
      } else if (tab === 'claims' && !claimsData) {
        setClaimsData(await getClaimsReport())
      } else if (tab === 'users' && !usersData) {
        setUsersData(await getUserGrowthReport())
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, `Failed to load ${tab} report`))
    } finally {
      setLoadingTab(null)
    }
  }

  const handleExport = async (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    setExportingTab(reportId)
    try {
      const blob = await exportReport(reportId, format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportId}-report.${format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Export failed'))
    } finally {
      setExportingTab(null)
    }
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Generate and export business reports</p>
      </div>

      <Tabs defaultValue="sales" className="space-y-6" onValueChange={loadTab}>
        <TabsList>
          <TabsTrigger value="sales" onClick={() => loadTab('sales')}>Sales Reports</TabsTrigger>
          <TabsTrigger value="revenue" onClick={() => loadTab('revenue')}>Revenue Reports</TabsTrigger>
          <TabsTrigger value="claims" onClick={() => loadTab('claims')}>Claims Reports</TabsTrigger>
          <TabsTrigger value="users" onClick={() => loadTab('users')}>User Growth</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          {loadingTab === 'sales' ? <LoadingCard /> : salesData?.sales ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Total Sales"
                  value={salesData.sales.total_sales}
                  sub={<GrowthBadge growth={salesData.sales.growth} /> as unknown as string}
                />
                {salesData.sales.by_category.slice(0, 2).map((cat, i) => (
                  <StatCard
                    key={i}
                    title={cat.category}
                    value={cat.count}
                    sub={`${formatCurrency(cat.amount)} revenue`}
                  />
                ))}
              </div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Sales by Category</CardTitle>
                      <CardDescription>Breakdown of policies sold per category</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleExport('sales', 'pdf')}
                      disabled={exportingTab === 'sales'}
                    >
                      {exportingTab === 'sales' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                      Export PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <BreakdownTable
                    rows={salesData.sales.by_category}
                    col1="Category"
                    col2="Policies Sold"
                  />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <BarChart3 className="h-12 w-12 mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Click the Sales Reports tab to load data</p>
                <Button variant="outline" className="mt-4" onClick={() => loadTab('sales')}>Load Sales Report</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          {loadingTab === 'revenue' ? <LoadingCard /> : revenueData?.revenue ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(revenueData.revenue.total_revenue)}
                  sub={<GrowthBadge growth={revenueData.revenue.growth} /> as unknown as string}
                />
                <StatCard
                  title="Periods Tracked"
                  value={revenueData.revenue.by_period.length}
                  sub="Data points available"
                />
              </div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Revenue by Period</CardTitle>
                      <CardDescription>Revenue trend over time</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleExport('revenue', 'excel')}
                      disabled={exportingTab === 'revenue'}
                    >
                      {exportingTab === 'revenue' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                      Export Excel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <BreakdownTable
                    rows={revenueData.revenue.by_period}
                    col1="Period"
                    col2="Revenue (KES)"
                  />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <BarChart3 className="h-12 w-12 mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Click the Revenue Reports tab to load data</p>
                <Button variant="outline" className="mt-4" onClick={() => loadTab('revenue')}>Load Revenue Report</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims" className="space-y-4">
          {loadingTab === 'claims' ? <LoadingCard /> : claimsData?.claims ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Total Claims" value={claimsData.claims.total_claims} />
                <StatCard
                  title="Claims Ratio"
                  value={`${(claimsData.claims.claims_ratio * 100).toFixed(1)}%`}
                  sub="Claims vs policies"
                />
                <StatCard
                  title="Avg Settlement"
                  value={formatCurrency(claimsData.claims.avg_settlement)}
                />
              </div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Claims by Status</CardTitle>
                      <CardDescription>Distribution of claim outcomes</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleExport('claims', 'csv')}
                      disabled={exportingTab === 'claims'}
                    >
                      {exportingTab === 'claims' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {claimsData.claims.by_status.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">{item.status.replace('_', ' ')}</Badge>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <BarChart3 className="h-12 w-12 mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Click the Claims Reports tab to load data</p>
                <Button variant="outline" className="mt-4" onClick={() => loadTab('claims')}>Load Claims Report</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* User Growth Tab */}
        <TabsContent value="users" className="space-y-4">
          {loadingTab === 'users' ? <LoadingCard /> : usersData?.users ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Total Users" value={usersData.users.total_users} />
                <StatCard title="New Users" value={usersData.users.new_users} sub="This period" />
                <StatCard
                  title="Retention Rate"
                  value={`${(usersData.users.retention_rate * 100).toFixed(1)}%`}
                />
              </div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Users by Role</CardTitle>
                      <CardDescription>User distribution across roles</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleExport('user-growth', 'csv')}
                      disabled={exportingTab === 'user-growth'}
                    >
                      {exportingTab === 'user-growth' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <BreakdownTable rows={usersData.users.by_role} col1="Role" col2="Count" />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <BarChart3 className="h-12 w-12 mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Click the User Growth tab to load data</p>
                <Button variant="outline" className="mt-4" onClick={() => loadTab('users')}>Load Growth Report</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
