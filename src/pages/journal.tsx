import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { JournalForm } from '@/components/journal/journal-form'
import { JournalCard } from '@/components/journal/journal-card'
import { useJournals } from '@/hooks/use-journal'
import { Plus } from 'lucide-react'
import type { DailyJournal } from '@/types/database'
import type { JournalFormData } from '@/lib/validators'

export function JournalPage() {
  const { journals, loading, upsertJournal } = useJournals()
  const [showForm, setShowForm] = useState(false)
  const [editingJournal, setEditingJournal] = useState<DailyJournal | null>(null)

  const handleSubmit = async (data: JournalFormData) => {
    await upsertJournal(data)
    setShowForm(false)
    setEditingJournal(null)
  }

  if (loading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daily Journal</h1>
        <Button onClick={() => { setEditingJournal(null); setShowForm(true) }} className="gap-2">
          <Plus className="h-4 w-4" /> New Entry
        </Button>
      </div>

      {journals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="mb-4">No journal entries yet. Start documenting your trading day!</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Write Today's Journal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {journals.map((journal) => (
            <JournalCard
              key={journal.id}
              journal={journal}
              onClick={() => { setEditingJournal(journal); setShowForm(true) }}
            />
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl" onClose={() => setShowForm(false)}>
          <DialogHeader>
            <DialogTitle>{editingJournal ? 'Edit Journal Entry' : 'New Journal Entry'}</DialogTitle>
          </DialogHeader>
          <JournalForm
            journal={editingJournal}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingJournal(null) }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
