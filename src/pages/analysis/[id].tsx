// pages/analysis/[id].tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import HtmlReport from '../../src/components/HtmlReport'
import ChatWithReportBot from '../../src/components/ChatWithReportBot'

const AnalysisDetailPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchAnalysis = async () => {
      const { data, error } = await supabase
        .from('ai_analyses')
        .select('*')
        .eq('id', id)
        .single()

      if (error) console.error('Error fetching analysis:', error)
      else setAnalysis(data)
      setLoading(false)
    }

    fetchAnalysis()
  }, [id])

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow && analysis?.html_report) {
      printWindow.document.write(`
        <html>
          <head><title>${analysis.name}</title></head>
          <body>${analysis.html_report}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  if (loading) return <p className="p-6">Loading analysis...</p>
  if (!analysis) return <p className="p-6 text-red-500">Analysis not found.</p>

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between max-w-4xl mx-auto px-6 pt-6">
        <button
          onClick={() => router.back()}
          className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded border"
        >
          ← Go Back
        </button>
        <button
          onClick={handleExportPDF}
          className="text-sm px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
        >
          Export to PDF
        </button>
      </div>
      <HtmlReport html={analysis.html_report} title={analysis.name} />
      <ChatWithReportBot context={analysis.html_report} />
    </div>
  )
}

export default AnalysisDetailPage

