import { ImageUp, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { photoAccept } from './localPhoto'
import { nameLimit } from './studioModel'
import type { LocalPhoto } from './studioModel'

type Props = {
  name: string
  nameError: string
  onName: (name: string) => void
  onNameBlur: () => void
  photo: LocalPhoto | null
  photoError: string
  onPhoto: (files: FileList) => void
  onRemove: () => void
}

export function AttendeeDetails({ name, nameError, onName, onNameBlur, photo, photoError, onPhoto, onRemove }: Props) {
  const chooseButton = useRef<HTMLButtonElement>(null)
  const picker = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  return (
    <section className="studio-panel studio-details" aria-labelledby="attendee-heading">
      <h2 id="attendee-heading">Attendee details</h2>
      <div className="studio-field">
        <label htmlFor="attendee-name">Attendee name</label>
        <input
          id="attendee-name"
          type="text"
          autoComplete="name"
          placeholder="e.g. Adeola O’Neill"
          value={name}
          required
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? 'name-limit name-error' : 'name-limit'}
          onChange={e => onName(e.target.value)}
          onBlur={onNameBlur}
        />
        <p id="name-limit" className="studio-help">{Array.from(name).length} / {nameLimit} characters</p>
        {nameError && <p id="name-error" className="studio-error" role="alert">{nameError}</p>}
      </div>
      <div className="studio-field">
        <h3>Photograph</h3>
        <input
          ref={picker}
          hidden
          type="file"
          aria-label="Photograph file"
          accept={photoAccept}
          onChange={e => {
            if (e.target.files) onPhoto(e.target.files)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          ref={chooseButton}
          className="studio-dropzone"
          data-dragging={dragging}
          aria-describedby="photo-help"
          onClick={() => picker.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={e => {
            if (!(e.relatedTarget instanceof Node) || !e.currentTarget.contains(e.relatedTarget)) setDragging(false)
          }}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            onPhoto(e.dataTransfer.files)
          }}
        >
          <ImageUp size={26} aria-hidden="true" />
          <strong>{photo ? 'Replace photo' : 'Choose photo'}</strong>
          <span>or drag and drop</span>
        </button>
        <p id="photo-help" className="studio-help">JPEG, PNG or WebP · Up to 10 MB and 32 MP · A clear upper-body photo works best.</p>
        {photoError && <p className="studio-error" role="alert">{photoError}</p>}
        {photo && (
          <div className="studio-photo-summary">
            <img src={photo.url} alt="" width={48} height={48} />
            <span>{photo.file.name}</span>
            <button type="button" className="studio-icon-button" aria-label="Remove photo" onClick={() => {
              onRemove()
              chooseButton.current?.focus()
            }}><Trash2 size={18} aria-hidden="true" /></button>
          </div>
        )}
        <p className="studio-help">Your photo stays in this browser.</p>
      </div>
    </section>
  )
}
