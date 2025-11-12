'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DiagnosticsOverview } from './diagnostics-overview'
import { DiagnosticsPorts } from './diagnostics-ports'
import { PM2ProcessList } from './pm2-process-list'
import { NginxPortsManager } from './nginx-ports-manager'
import { HealthDashboard } from './health-dashboard'
import { ZombieProcessKiller } from './zombie-process-killer'
import { BarChart, Network, Server, Activity, Settings } from 'lucide-react'

export function DiagnosticsTabs() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="ports" className="flex items-center gap-2">
          <Network className="h-4 w-4" />
          Ports
        </TabsTrigger>
        <TabsTrigger value="pm2" className="flex items-center gap-2">
          <Server className="h-4 w-4" />
          PM2
        </TabsTrigger>
        <TabsTrigger value="nginx" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Nginx
        </TabsTrigger>
        <TabsTrigger value="system" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          System
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <DiagnosticsOverview onNavigate={setActiveTab} />
      </TabsContent>

      <TabsContent value="ports" className="mt-6">
        <DiagnosticsPorts />
      </TabsContent>

      <TabsContent value="pm2" className="mt-6">
        <PM2ProcessList />
      </TabsContent>

      <TabsContent value="nginx" className="mt-6">
        <NginxPortsManager />
      </TabsContent>

      <TabsContent value="system" className="mt-6">
        <div className="space-y-6">
          <HealthDashboard />
          <ZombieProcessKiller />
        </div>
      </TabsContent>
    </Tabs>
  )
}
