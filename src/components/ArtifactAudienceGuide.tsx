import { memo } from 'react'

interface ArtifactAudienceGuideProps {
  plainEnglish: string
  hiringManager: string
}

export const ArtifactAudienceGuide = memo(function ArtifactAudienceGuide({ plainEnglish, hiringManager }: ArtifactAudienceGuideProps) {
  return (
    <section className="artifact-audience-guide" aria-labelledby="audience-guide-title">
      <header>
        <p className="eyebrow">Choose your way in</p>
        <h2 id="audience-guide-title">The quick story—or the engineering proof.</h2>
      </header>
      <div>
        <details open>
          <summary><span>Plain-English tour</span><small>No data background needed</small><b aria-hidden="true">+</b></summary>
          <p>{plainEnglish}</p>
        </details>
        <details>
          <summary><span>For the hiring manager</span><small>What this proves I can build</small><b aria-hidden="true">+</b></summary>
          <p>{hiringManager}</p>
        </details>
      </div>
    </section>
  )
})
