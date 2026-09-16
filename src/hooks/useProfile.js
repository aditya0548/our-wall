import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function useProfile(session) {
  const [profile, setProfile] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Fetch own profile
      const { data: ownProfile, error: ownError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (ownError) throw ownError;
      setProfile(ownProfile);

      // Find partner via space_members
      const { data: memberData } = await supabase
        .from('space_members')
        .select('space_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (memberData?.space_id) {
        const { data: allMembers } = await supabase
          .from('space_members')
          .select('user_id')
          .eq('space_id', memberData.space_id);
          
        if (allMembers) {
          const partnerMember = allMembers.find(m => m.user_id !== session.user.id);
          if (partnerMember) {
            const { data: pProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', partnerMember.user_id)
              .maybeSingle();
            
            setPartnerProfile(pProfile);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [session]);

  const updateProfile = async (updates) => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id);

      if (error) throw error;
      await fetchProfiles();
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    partnerProfile,
    loading,
    refresh: fetchProfiles,
    updateProfile
  };
}
