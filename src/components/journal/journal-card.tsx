import { format, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOODS } from '@/lib/constants'
import type { DailyJournal } from '@/types/database'

interface JournalCardProps {
  journal: DailyJournal
  onClick: () => void
}

export function JournalCard({ journal, onClick }: JournalCardProps) {
  const mood = MOODS.find((m) => m.value === journal.mood)

  return (
    <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {format(parseISO(journal.journal_date), 'EEEE, MMMM d, yyyy')}
          </CardTitle>
          {mood && (
            <Badge variant="outline" className="gap-1">
              {mood.emoji} {mood.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {journal.pre_market_plan && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
            <span className="font-medium text-foreground">Plan: </span>
            {journal.pre_market_plan}
          </p>
        )}
        {journal.post_market_review && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            <span className="font-medium text-foreground">Review: </span>
            {journal.post_market_review}
          </p>
        )}
        {!journal.pre_market_plan && !journal.post_market_review && journal.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">{journal.notes}</p>
        )}
      </CardContent>
    </Card>
  )
}
