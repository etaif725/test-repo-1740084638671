// src/components/Dashboard/ApiKeys.jsx
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useSupabase } from '@/app/supabase-provider';

export default function ApiKeys() {
  const { supabase } = useSupabase();
  const [integration, setIntegration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApiKeys() {
      try {
        setLoading(true);  
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data, error } = await supabase.from('integrations')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          if (error) throw error;
          setIntegration(data);
        }
      } catch (error) {
        console.error('Error loading API keys:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadApiKeys();
  }, []);

  if (loading) return <div>Loading API keys...</div>;
  
  return (
    <div className="api-keys-container">
      <h2>API Keys</h2>
      {integration ? (
        <div className="api-keys">
          <div className="key-item">
            <span>Public API Key:</span>
            <code>{integration.public_api_key}</code>
          </div>
          <div className="key-item">
            <span>Private API Key:</span>
            <code>{integration.private_api_key}</code>
            <p className="warning">Keep this key secret. Do not share it in public repositories or client-side code.</p>
          </div>
          <div className="key-item">
            <span>Dashboard ID:</span>
            <code>{integration.dashboard_id}</code>
          </div>
          <div className="key-item">
            <span>Organization ID:</span>
            <code>{integration.organization_id}</code>
          </div>
          <div className="key-status">
            Status: <span className={`status ${integration.status}`}>{integration.status}</span>
          </div>
        </div>
      ) : (
        <div className="no-keys">
          <p>No API keys found. Generate keys to get started.</p>
          <button>Generate API Keys</button>
        </div>
      )}
    </div>
  );
}