import { useState, useRef, useEffect } from 'react'
import { useScreenshots } from '@/hooks/use-screenshots'
import { Select } from '@/components/ui/select'
import { Upload, X, Image } from 'lucide-react'
import type { ScreenshotType } from '@/types/database'

interface ScreenshotUploadProps {
  tradeId: string
}

export function ScreenshotUpload({ tradeId }: ScreenshotUploadProps) {
  const { screenshots, uploadScreenshot, deleteScreenshot, getSignedUrl } = useScreenshots(tradeId)
  const [uploading, setUploading] = useState(false)
  const [screenshotType, setScreenshotType] = useState<ScreenshotType>('before')
  const [urls, setUrls] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    screenshots.forEach(async (s) => {
      if (!urls[s.id]) {
        const url = await getSignedUrl(s.storage_path)
        setUrls((prev) => ({ ...prev, [s.id]: url }))
      }
    })
  }, [screenshots, getSignedUrl, urls])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await uploadScreenshot(tradeId, file, screenshotType)
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return

    setUploading(true)
    try {
      await uploadScreenshot(tradeId, file, screenshotType)
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select
          options={[
            { value: 'before', label: 'Before Trade' },
            { value: 'after', label: 'After Trade' },
            { value: 'other', label: 'Other' },
          ]}
          value={screenshotType}
          onChange={(e) => setScreenshotType(e.target.value as ScreenshotType)}
          className="w-40"
        />
      </div>

      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        {uploading ? (
          <p className="text-muted-foreground">Uploading...</p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drop an image here or click to upload
            </p>
          </div>
        )}
      </div>

      {screenshots.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {screenshots.map((s) => (
            <div key={s.id} className="relative group rounded-lg overflow-hidden border">
              {urls[s.id] ? (
                <img
                  src={urls[s.id]}
                  alt={s.file_name}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center bg-muted">
                  <Image className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-1 left-1">
                <span className="text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                  {s.screenshot_type}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteScreenshot(s.id, s.storage_path) }}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
