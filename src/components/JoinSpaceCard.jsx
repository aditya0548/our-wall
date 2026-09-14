import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

export default function JoinSpaceCard({ onSpaceJoined }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.rpc('join_space_by_code', { input_code: cleanCode });
      
      if (error) throw error;
      
      // data is an array of records from the Postgres function table return
      const result = data[0];
      
      if (!result.success) {
        setError(result.error_message);
        return;
      }
      
      onSpaceJoined();
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pairing-card">
      <h3 className="card-title">Enter code</h3>
      <p className="card-text" style={{ marginBottom: '16px' }}>
        Connect to an existing space.
      </p>
      
      <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column' }}>
        <input 
          type="text" 
          className="pairing-input"
          placeholder="XXXXXX"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={loading}
        />
        {error && <p className="auth-error" style={{ marginBottom: '16px' }}>{error}</p>}
        
        <button 
          type="submit" 
          className="auth-button" 
          disabled={loading || code.trim().length !== 6}
        >
          {loading && <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Connecting...' : 'Connect'}
        </button>
      </form>
    </div>
  );
}
