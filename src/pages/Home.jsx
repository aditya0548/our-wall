import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useSpace from '../hooks/useSpace';
import { useTheme } from '../theme/ThemeProvider';
import CreateSpaceCard from '../components/CreateSpaceCard';
import JoinSpaceCard from '../components/JoinSpaceCard';
import ShareCodeScreen from '../components/ShareCodeScreen';
import Wall from './Wall';
import '../styles/pairing.css';
import '../styles/auth.css';

export default function Home({ session }) {
  const { space, loading: spaceLoading, refresh } = useSpace(session);
  const { profile, loading: profileLoading } = useTheme();

  if (spaceLoading || profileLoading) {
    return (
      <div className="pairing-container">
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  // State 4: Connected (2 members)
  if (space && space.isFull) {
    if (!profile) {
      return <Navigate to="/setup" replace />;
    }
    return <Wall session={session} spaceId={space.id} />;
  }

  // State 2: Waiting for partner (1 member)
  if (space && !space.isFull) {
    return (
      <div className="pairing-container">
        <ShareCodeScreen space={space} onCancel={refresh} />
      </div>
    );
  }

  // State 1 & 3: No space yet, show Create and Join side-by-side
  return (
    <div className="pairing-container">
      <div className="pairing-state-1">
        <div className="pairing-header">
          <h2 className="pairing-title display-font">Start your shared space</h2>
        </div>
        
        <div className="cards-container">
          <CreateSpaceCard onSpaceCreated={refresh} />
          
          <div className="card-divider">or</div>
          
          <JoinSpaceCard onSpaceJoined={refresh} />
        </div>
      </div>
    </div>
  );
}
