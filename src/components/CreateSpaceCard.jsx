import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

export default function CreateSpaceCard({ onSpaceCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.rpc('create_space_for_current_user');
      if (error) throw error;
      
      onSpaceCreated();
    } catch (err) {
      console.error(err);
      setError('Could not create space. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pairing-card">
      <h3 className="card-title">Create a space</h3>
      <p className="card-text">
        Get a code to share with your partner.
      </p>
      
      {error && <p className="auth-error" style={{ marginBottom: '16px' }}>{error}</p>}
      
      <button 
        className="auth-button" 
        onClick={handleCreate} 
        disabled={loading}
      >
        {loading && <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
        {loading ? 'Creating...' : 'Create Space'}
      </button>
    </div>
  );
}
