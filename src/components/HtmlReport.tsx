// src/components/HtmlReport.tsx
import React from 'react'

type HtmlReportProps = {
  html: string
  title?: string
}

const HtmlReport: React.FC<HtmlReportProps> = ({ html, title }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {title && <h1 className="text-2xl font-bold mb-4">{title}</h1>}
      <div
        className="prose max-w-none border p-4 rounded bg-white shadow"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export default HtmlReport

