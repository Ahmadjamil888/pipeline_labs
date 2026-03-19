"""
Frontend Progress Screen
React component to display live deployment status.
"""
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pipeline-backend-staging.up.railway.app";

interface Service {
  name: string;
  framework: string;
  language: string;
  platform: string;
  status: string;
  url?: string;
}

interface ProgressStep {
  id: string;
  step: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export default function DeploymentProgress() {
  const { projectId } = useParams<{ projectId: string }>();
  const [status, setStatus] = useState<string>('loading');
  const [steps, setSteps] = useState<ProgressStep[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Poll for progress every 2 seconds
  useEffect(() => {
    if (!projectId) return;

    const pollProgress = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/projects/${projectId}/progress`);
        if (!res.ok) throw new Error('Failed to fetch progress');
        
        const data = await res.json();
        setStatus(data.status);
        setSteps(data.steps || []);
        setServices(data.services || []);
        
        if (data.error) {
          setError(data.error);
        }
      } catch (err) {
        console.error('Progress polling error:', err);
      }
    };

    pollProgress(); // Initial fetch
    const interval = setInterval(pollProgress, 2000);

    return () => clearInterval(interval);
  }, [projectId]);

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return '✅';
      case 'running':
        return '⏳';
      case 'error':
        return '❌';
      default:
        return '⏸️';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Deployment Progress</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <h3 className="font-semibold">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          status === 'deployed' ? 'bg-green-100 text-green-800' :
          status === 'error' ? 'bg-red-100 text-red-800' :
          status === 'running' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {/* Progress Steps */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Progress</h2>
        <div className="space-y-3">
          {steps.length === 0 ? (
            <p className="text-gray-500">Waiting for pipeline to start...</p>
          ) : (
            steps.map((step) => (
              <div key={step.id} className={`flex items-start p-3 rounded-lg ${
                step.status === 'running' ? 'bg-blue-50 border border-blue-200' :
                step.status === 'complete' ? 'bg-green-50' :
                step.status === 'error' ? 'bg-red-50' :
                'bg-gray-50'
              }`}>
                <span className="mr-3 text-xl">{getStepIcon(step.status)}</span>
                <div className="flex-1">
                  <p className="font-medium">{step.step}</p>
                  <p className="text-sm text-gray-600">{step.message}</p>
                  {step.details && Object.keys(step.details).length > 0 && (
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(step.details, null, 2)}
                    </pre>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(step.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detected Services */}
      {services.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Detected Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{service.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    service.status === 'deployed' ? 'bg-green-100 text-green-700' :
                    service.status === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {service.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{service.framework} • {service.language}</p>
                <p className="text-sm text-gray-500">Platform: {service.platform}</p>
                {service.url && (
                  <a 
                    href={service.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                  >
                    Visit →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
