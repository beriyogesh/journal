import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useFirmPresets, type FirmPresetFormData } from '@/hooks/use-firm-presets'
import { Plus, Edit, Trash2, Download } from 'lucide-react'
import type { FirmPreset } from '@/types/firm-preset'

export function FirmsPage() {
  const { presets, loading, createPreset, updatePreset, deletePreset, seedDefaults } = useFirmPresets()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<FirmPreset | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const data: FirmPresetFormData = {
      name: form.get('name') as string,
      max_daily_loss_pct: form.get('max_daily_loss_pct') ? parseFloat(form.get('max_daily_loss_pct') as string) : null,
      max_total_drawdown_pct: form.get('max_total_drawdown_pct') ? parseFloat(form.get('max_total_drawdown_pct') as string) : null,
      profit_target_pct: form.get('profit_target_pct') ? parseFloat(form.get('profit_target_pct') as string) : null,
      trailing_drawdown: form.get('trailing_drawdown') === 'on',
      notes: (form.get('notes') as string) || undefined,
    }

    if (editing) {
      await updatePreset(editing.id, data)
    } else {
      await createPreset(data)
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) {
      await deletePreset(id)
    }
  }

  const handleSeedDefaults = async () => {
    if (confirm('This will add all default prop firms (FTMO, TopStep, etc.). Existing ones will be updated. Continue?')) {
      await seedDefaults()
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prop Firms</h1>
          <p className="text-sm text-muted-foreground">Manage your prop firm presets and their default rules</p>
        </div>
        <div className="flex gap-2">
          {presets.length === 0 && (
            <Button variant="outline" onClick={handleSeedDefaults} className="gap-2">
              <Download className="h-4 w-4" /> Load Defaults
            </Button>
          )}
          <Button onClick={() => { setEditing(null); setShowForm(true) }} className="gap-2">
            <Plus className="h-4 w-4" /> Add Firm
          </Button>
        </div>
      </div>

      {presets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="mb-4">No firms added yet. Add your own or load the default presets.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleSeedDefaults} className="gap-2">
                <Download className="h-4 w-4" /> Load Defaults
              </Button>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add Firm
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((preset) => (
            <Card key={preset.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{preset.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => { setEditing(preset); setShowForm(true) }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(preset.id, preset.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Daily Loss</span>
                    <span>{preset.max_daily_loss_pct != null ? `${preset.max_daily_loss_pct}%` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Drawdown</span>
                    <span>{preset.max_total_drawdown_pct != null ? `${preset.max_total_drawdown_pct}%` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit Target</span>
                    <span>{preset.profit_target_pct != null ? `${preset.profit_target_pct}%` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trailing DD</span>
                    <span>{preset.trailing_drawdown ? 'Yes' : 'No'}</span>
                  </div>
                  {preset.notes && (
                    <p className="text-xs text-muted-foreground pt-1 border-t mt-2">{preset.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent onClose={() => { setShowForm(false); setEditing(null) }}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Firm' : 'Add Firm'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Firm Name *</Label>
              <Input name="name" required defaultValue={editing?.name ?? ''} placeholder="e.g. FTMO" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Daily Loss %</Label>
                <Input name="max_daily_loss_pct" type="number" step="0.01" defaultValue={editing?.max_daily_loss_pct ?? ''} placeholder="5" />
              </div>
              <div className="space-y-2">
                <Label>Max DD %</Label>
                <Input name="max_total_drawdown_pct" type="number" step="0.01" defaultValue={editing?.max_total_drawdown_pct ?? ''} placeholder="10" />
              </div>
              <div className="space-y-2">
                <Label>Profit Target %</Label>
                <Input name="profit_target_pct" type="number" step="0.01" defaultValue={editing?.profit_target_pct ?? ''} placeholder="10" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="trailing" name="trailing_drawdown" defaultChecked={editing?.trailing_drawdown ?? false} className="rounded" />
              <Label htmlFor="trailing">Trailing Drawdown</Label>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea name="notes" defaultValue={editing?.notes ?? ''} placeholder="Any extra rules or info..." rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</Button>
              <Button type="submit">{editing ? 'Update' : 'Add Firm'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
