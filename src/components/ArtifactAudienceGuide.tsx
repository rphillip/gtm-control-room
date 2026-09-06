interface ArtifactAudienceGuideProps {
  plainEnglish: string
}

export function ArtifactAudienceGuide({ plainEnglish }: ArtifactAudienceGuideProps) {
  return (
    <section className="artifact-audience-guide" aria-labelledby="audience-guide-title">
      <p className="eyebrow">Plain-English guide</p>
      <h2 id="audience-guide-title">No data background needed.</h2>
      <p>{plainEnglish}</p>
    </section>
  )
}
