import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Copy } from 'lucide-react';

export default function Pairing({ session }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ownCode, setOwnCode] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkMembership();
  }, [session]);

  const checkMembership = async () => {
    try {
      const { data, error } = await supabase
        .from('space_members')
        .select('space_id')
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Already in a space
        navigate('/wall', { replace: true });
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error checking membership:', err);
      setLoading(false);
    }
  };

  const handleCreateSpace = async () => {
    try {
      setLoading(true);
      // Generate 6 char alphanumeric code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create space
      const { data: spaceData, error: spaceError } = await supabase
        .from('spaces')
        .insert([{ connection_code: code }])
        .select('id')
        .single();
        
      if (spaceError) throw spaceError;

      // Join space member
      const { error: memberError } = await supabase
        .from('space_members')
        .insert([{ space_id: spaceData.id, user_id: session.user.id }]);

      if (memberError) throw memberError;

      setOwnCode(code);
    } catch (err) {
      console.error('Error creating space:', err);
      setError('Could not create space.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSpace = async (e) => {
    e.preventDefault();
    if (joinCode.length !== 6) return;
    
    try {
      setLoading(true);
      setError('');
      
      const { data, error: rpcError } = await supabase.rpc('join_space', {
        join_code: joinCode.toUpperCase()
      });

      if (rpcError) throw rpcError;

      // Joined successfully
      navigate('/wall', { replace: true });
    } catch (err) {
      console.error('Error joining space:', err);
      setError(err.message || 'Invalid code or space is full.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={centerStyle}>Loading...</div>;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {ownCode ? (
          <div>
            <h1 style={titleStyle}>Your Code</h1>
            <div style={codeBoxStyle}>
              <span style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '4px' }}>
                {ownCode}
              </span>
              <button 
                onClick={() => navigator.clipboard.writeText(ownCode)}
                style={copyBtnStyle}
                title="Copy code"
              >
                <Copy size={20} />
              </button>
            </div>
            <p style={subtitleStyle}>Share this code with your partner.</p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Wait here until they connect, or refresh the page.
            </p>
            <button onClick={checkMembership} style={{ ...buttonStyle, marginTop: '24px' }}>
              I've been paired
            </button>
          </div>
        ) : (
          <div>
            <div style={sectionStyle}>
              <h2 style={titleStyle}>Create your shared space</h2>
              <button onClick={handleCreateSpace} style={buttonStyle}>
                Create Space
              </button>
            </div>

            <div style={dividerStyle}>
              <span style={dividerTextStyle}>OR</span>
            </div>

            <div style={sectionStyle}>
              <h2 style={titleStyle}>Enter your partner's code</h2>
              <form onSubmit={handleJoinSpace} style={formStyle}>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="6-character code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  style={inputStyle}
                />
                <button type="submit" disabled={joinCode.length !== 6} style={buttonStyle}>
                  Connect
                </button>
              </form>
              {error && <p style={errorStyle}>{error}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const centerStyle = {
  display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)'
};

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '16px'
};

const cardStyle = {
  backgroundColor: 'var(--bg-card)',
  padding: '48px 32px',
  borderRadius: '12px',
  maxWidth: '400px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 4px 24px rgba(0,0,0,0.05)'
};

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const titleStyle = {
  fontSize: '20px',
  color: 'var(--text-primary)',
};

const subtitleStyle = {
  color: 'var(--text-muted)',
  marginBottom: '16px'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const inputStyle = {
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #EAE5E0',
  fontSize: '16px',
  width: '100%',
  textAlign: 'center',
  letterSpacing: '2px',
  backgroundColor: 'var(--bg-primary)'
};

const buttonStyle = {
  backgroundColor: 'var(--accent)',
  color: 'white',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  transition: 'opacity 0.2s ease',
  width: '100%'
};

const dividerStyle = {
  margin: '32px 0',
  position: 'relative',
  borderTop: '1px solid #EAE5E0'
};

const dividerTextStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'var(--bg-card)',
  padding: '0 16px',
  color: 'var(--text-muted)',
  fontSize: '14px'
};

const codeBoxStyle = {
  backgroundColor: 'var(--bg-primary)',
  padding: '24px',
  borderRadius: '8px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '16px'
};

const copyBtnStyle = {
  color: 'var(--text-muted)',
  padding: '8px',
  borderRadius: '4px',
  display: 'flex'
};

const errorStyle = {
  color: '#D85C5C', // Soft red
  fontSize: '14px',
  marginTop: '8px'
};
