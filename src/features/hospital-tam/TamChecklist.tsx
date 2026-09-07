import { useState } from 'react'

export const tamChecklist = [
  'Can I explain what each source row represents?',
  'Do I know which organization actually makes the purchase?',
  'Can I explain why the hospital records belong to that organization?',
  'Are uncertain or conflicting matches waiting for human review?',
  'Am I prioritizing organizations only after resolving their identities?',
]

export function TamChecklist() {
  const [checked, setChecked] = useState(() => tamChecklist.map(() => false))
  const checkedCount = checked.filter(Boolean).length

  return (
    <section id="checklist" className="section tam-checklist" aria-labelledby="checklist-title">
      <header><div><p className="eyebrow">07 / Fiche de contrôle</p><h2 id="checklist-title">Can You Explain the Market?</h2></div><strong>{checkedCount} / {tamChecklist.length} checked</strong></header>
      <p>If these 5 questions have clear answers, the account universe is ready for sales research. The checkboxes stay in your browser and send nothing anywhere.</p>
      <ul>
        {tamChecklist.map((item, index) => (
          <li key={item} className={checked[index] ? 'is-checked' : ''}>
            <label><input type="checkbox" checked={checked[index]} onChange={() => setChecked((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value))} /><span aria-hidden="true">{checked[index] ? '✓' : ''}</span>{item}</label>
          </li>
        ))}
      </ul>
      <p className="visually-hidden" role="status" aria-live="polite">{checkedCount} of {tamChecklist.length} market checks complete.</p>
    </section>
  )
}
