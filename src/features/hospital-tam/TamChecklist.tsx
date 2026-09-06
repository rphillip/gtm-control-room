import { useState } from 'react'

export const tamChecklist = [
  'What is the source unit of record?',
  'What is the GTM buying unit?',
  'What key connects them?',
  'Can one source entity roll up to another?',
  'Can multiple resolved entities still share one parent?',
  'What is the dedupe key at each layer?',
  'Are identifiers preserved consistently?',
  'Is scoring happening before or after entity resolution?',
  'Can I explain why each final row is one sales account?',
  'Have I manually reviewed the weirdest edge cases?',
]

export function TamChecklist() {
  const [checked, setChecked] = useState(() => tamChecklist.map(() => false))
  const checkedCount = checked.filter(Boolean).length

  return (
    <section id="checklist" className="section tam-checklist" aria-labelledby="checklist-title">
      <header><div><p className="eyebrow">07 / Fiche de contrôle</p><h2 id="checklist-title">Before You Call It a TAM</h2></div><strong>{checkedCount} / {tamChecklist.length} checked</strong></header>
      <p>A screenshot-ready review card. The checkboxes stay in your browser and send nothing anywhere.</p>
      <ul>
        {tamChecklist.map((item, index) => (
          <li key={item} className={checked[index] ? 'is-checked' : ''}>
            <label><input type="checkbox" checked={checked[index]} onChange={() => setChecked((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value))} /><span aria-hidden="true">{checked[index] ? '✓' : ''}</span>{item}</label>
          </li>
        ))}
      </ul>
      <p className="visually-hidden" role="status" aria-live="polite">{checkedCount} of {tamChecklist.length} TAM checks complete.</p>
    </section>
  )
}
