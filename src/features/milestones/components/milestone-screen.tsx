import { Flag } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function MilestoneScreen() {
  return (
    <div className="flex min-h-full flex-col gap-6">
      <Card className="ops-panel gap-0 rounded-[32px] py-0">
        <CardHeader className="px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <Flag className="size-6" />
            </div>
            <div>
              <p className="ops-kicker">Milestones</p>
              <CardTitle className="mt-2 text-[2rem] tracking-[-0.04em]">
                Milestone timeline
              </CardTitle>
              <CardDescription className="mt-3 max-w-2xl text-sm leading-7 sm:text-base">
                Timeline screen coming next.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="ops-panel gap-0 rounded-[32px] py-0">
        <CardContent className="grid gap-4 px-6 py-6 sm:grid-cols-3">
          <MilestonePlaceholder label="Scope" />
          <MilestonePlaceholder label="Dependencies" />
          <MilestonePlaceholder label="Review windows" />
        </CardContent>
      </Card>
    </div>
  )
}

function MilestonePlaceholder({ label }: { label: string }) {
  return (
    <div className="ops-panel-muted rounded-[24px] px-4 py-4">
      <Badge variant="outline">{label}</Badge>
    </div>
  )
}
