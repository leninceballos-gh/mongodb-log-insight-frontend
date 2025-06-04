import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUserOrganizations, getUserClusters, extractMetricsFromLogs } from '@/lib/api';

interface Cluster {
  id: string;
  name: string;
  description: string;
}

export default function ClusterLogParser() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const [logs, setLogs] = useState<FileList | null>(null);
  const [logPreview, setLogPreview] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadClusters() {
      const result = await getUserClusters();
      if (result) setClusters(result);
    }
    loadClusters();
  }, []);

  const handleLogSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setLogs(files);
      const reader = new FileReader();
      reader.onload = () => setLogPreview(reader.result as string);
      reader.readAsText(files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedCluster || !logs) {
      setMessage('Please select a cluster and log file(s).');
      return;
    }
    setProcessing(true);
    setMessage('Processing logs...');

    try {
      const metrics = await extractMetricsFromLogs(logs);
      // Save metrics and create AI analysis session
      // Send to OpenAI afterward...
      setMessage('Logs processed. Metrics extracted and analysis initiated.');
    } catch (err) {
      setMessage('Error during log processing.');
    }

    setProcessing(false);
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h2 className="text-xl font-semibold">Analyze MongoDB Logs</h2>

        <div>
          <label className="font-medium block mb-1">Select Cluster</label>
          <Select onValueChange={setSelectedCluster}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a cluster" />
            </SelectTrigger>
            <SelectContent>
              {clusters.map((cluster) => (
                <SelectItem key={cluster.id} value={cluster.id}>
                  {cluster.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="font-medium block mb-1">Select MongoDB Log Files</label>
          <Input type="file" multiple onChange={handleLogSelection} />
        </div>

        {logPreview && (
          <Textarea readOnly value={logPreview.slice(0, 2000)} rows={10} className="mt-2" />
        )}

        <Button disabled={processing} onClick={handleAnalyze}>
          {processing ? 'Processing...' : 'Start AI Analysis'}
        </Button>

        {message && <p className="text-sm text-muted-foreground mt-2">{message}</p>}
      </CardContent>
    </Card>
  );
}
