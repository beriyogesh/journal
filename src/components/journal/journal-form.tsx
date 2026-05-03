import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { journalSchema, type JournalFormData } from '@/lib/validators'
import { MOODS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { DailyJournal, MoodType } from '@/types/database'

interface JournalFormProps {
  journal?: DailyJournal | null
  date?: string
  onSubmit: (data: JournalFormData) => Promise<void>
  onCancel: () => void
}

export function JournalForm({ journal, date, onSubmit, onCancel }: JournalFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema) as any,
    defaultValues: journal
      ? {
          journal_date: journal.journal_date,
          pre_market_plan: journal.pre_market_plan ?? '',
          post_market_review: journal.post_market_review ?? '',
          mood: journal.mood,
          market_conditions: journal.market_conditions ?? '',
          daily_goals: journal.daily_goals ?? '',
          notes: journal.notes ?? '',
          lessons_learned: journal.lessons_learned ?? '',
        }
      : {
          journal_date: date ?? new Date().toISOString().split('T')[0],
        },
  })

  const selectedMood = watch('mood')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Date</Label>
        <Input type="date" {...register('journal_date')} />
      </div>

      <div className="space-y-2">
        <Label>How are you feeling?</Label>
        <div className="flex gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() => setValue('mood', mood.value as MoodType)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors',
                selectedMood === mood.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <span className="text-xl">{mood.emoji}</span>
              <span className="text-xs">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Pre-Market Plan</Label>
        <Textarea
          {...register('pre_market_plan')}
          placeholder="What's your plan for today? Key levels, setups to watch..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Daily Goals</Label>
        <Textarea
          {...register('daily_goals')}
          placeholder="What do you want to achieve today?"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Market Conditions</Label>
        <Textarea
          {...register('market_conditions')}
          placeholder="Overall market sentiment, news events, volatility..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Post-Market Review</Label>
        <Textarea
          {...register('post_market_review')}
          placeholder="How did the day go? Did you follow your plan?"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Lessons Learned</Label>
        <Textarea
          {...register('lessons_learned')}
          placeholder="Key takeaways from today..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>General Notes</Label>
        <Textarea {...register('notes')} placeholder="Anything else..." rows={2} />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Journal'}
        </Button>
      </div>
    </form>
  )
}
