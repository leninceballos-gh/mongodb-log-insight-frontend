// src/components/AnalysisHistory.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AnalysisHistory = () => {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [clusters, setClusters] = useState<any[]>([])
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [clusterFilter, setClusterFilter] = useState('')
  const [sortKey, setSortKey] = useState<'created_at' | 'organization_name' | 'cluster_name' | 'name'>('created_at')
  const [filtered, setFiltered] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: analysesData }, { data: clusterData }, { data: orgData }] = await Promise.all([
        supabase.from('ai_analyses').select('*').order('created_at', { ascending: false }),
        supabase.from('clusters').select('*'),
        supabase.from('organizations').select('*')
      ])

      const clusterMap = new Map(clusterData?.map(c => [c.id, c.name]))
      const orgMap = new Map(orgData?.map(o => [o.id, o.name]))

      const enriched = (analysesData || []).map((a) => ({
        ...a,
        cluster_name: clusterMap.get(a.cluster_id) || a.cluster_id,
        organization_name: orgMap.get(a.organization_id) || a.organization_id,
        status: a.status || 'complete',
        type: a.type || 'performance'
      }))

      setAnalyses(enriched)
      setFiltered(enriched)
      setClusters(clusterData || [])
      setOrganizations(orgData || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  useEffect(() => {
    let result = [...analyses]
    if (clusterFilter) {
      result = result.filter((a) =>
        a.cluster_name.toLowerCase().includes(clusterFilter.toLowerCase())
      )
    }
    result.sort((a, b) => {
      if (sortKey === 'created_at') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else {
        return a[sortKey].localeCompare(b[sortKey])
      }
    })
    setFiltered(result)
    setCurrentPage(1)
  }, [clusterFilter, analyses, sortKey])

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ai_analysis_history.json'
    link.click()
  }

  const exportCSV = () => {
    const header = ['Name', 'Cluster', 'Organization', 'Created At', 'Status', 'Type']
    const rows = filtered.map(a => [
      a.name,
      a.cluster_name,
      a.organization_name,
      new Date(a.created_at).toISOString(),
      a.status,
      a.type
    ])
    const csv = [header, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ai_analysis_history.csv'
    link.click()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return '🚀'
      case 'slow_queries': return '🐢'
      case 'summary': return '🧠'
      default: return '📊'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Your AI Analyses</h2>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <input
          type="text"
          value={clusterFilter}
          onChange={(e) => setClusterFilter(e.target.value)}
          placeholder="Filter by cluster name..."
          className="w-full sm:w-1/2 px-3 py-2 border rounded"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as 'created_at' | 'organization_name' | 'cluster_name' | 'name')}
          className="w-full sm:w-1/2 px-3 py-2 border rounded"
        >
          <option value="created_at">Sort by Newest</option>
          <option value="organization_name">Sort by Organization</option>
          <option value="cluster_name">Sort by Cluster</option>
          <option value="name">Sort by Analysis Name</option>
        </select>
      </div>

      <div className="mb-4 flex gap-3">
        <button onClick={exportJSON} className="px-4 py-2 bg-blue-600 text-white rounded">
          Export JSON
        </button>
        <button onClick={exportCSV} className="px-4 py-2 bg-green-600 text-white rounded">
          Export CSV
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-4">
          {paginated.map((analysis) => (
            <li
              key={analysis.id}
              className="p-4 border rounded shadow hover:bg-gray-50 cursor-pointer"
              onClick={() => window.location.href = `/analysis/${analysis.id}`}
            >
              <h3 className="font-bold text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>{getTypeIcon(analysis.type)}</span>
                  {analysis.name}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  analysis.status === 'pending' ? 'bg-yellow-300' :
                  analysis.status === 'error' ? 'bg-red-300' : 'bg-green-300'
                }`}>
                  {analysis.status}
                </span>
              </h3>
              <p className="text-sm text-gray-500">
                Org: {analysis.organization_name} | Cluster: {analysis.cluster_name} | Created: {new Date(analysis.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-between items-center mt-6">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default AnalysisHistory

