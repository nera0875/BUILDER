import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Zap } from 'lucide-react'

interface ZombieProcess {
  pid: number
  command: string
  parentPid: number
}

export function ZombieProcessKiller() {
  const zombies: ZombieProcess[] = []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Zombie Processes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {zombies.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              No zombie processes detected
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              System is clean
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {zombies.map(zombie => (
              <div key={zombie.pid} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="text-sm font-medium">PID: {zombie.pid}</p>
                  <p className="text-xs text-muted-foreground">{zombie.command}</p>
                </div>
                <Button size="sm" variant="destructive">
                  <Zap className="h-4 w-4 mr-1" />
                  Kill
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
