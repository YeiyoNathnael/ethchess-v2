//@ts-ignore
import { useState, useEffect, useCallback } from 'react';
import { 
  getTeam, 
  getUserTeams, 
  getTeamMembers, 
  joinTeam, 
  leaveTeam,
  searchTeams,
  getTeamJoinRequests,
  acceptJoinRequest,
  declineJoinRequest,
  kickTeamMember
} from '../api/teams';
import { useAuth } from './useAuth';

/**
 * Hook for fetching a single team
 * 
 * @param teamId - Team ID to fetch
 */
export function useTeam(teamId: string | null) {
  const [team, setTeam] = useState<any | null>(null);
  const [loading, setLoading] = useState(!!teamId);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeam = useCallback(async () => {
    if (!teamId) {
      setTeam(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const teamData = await getTeam(teamId);
      setTeam(teamData);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return {
    team,
    loading,
    error,
    refresh: fetchTeam
  };
}

/**
 * Hook for fetching teams a user belongs to
 * 
 * @param username - Username to fetch teams for (defaults to current user)
 */
export function useUserTeams(username?: string) {
  const { isAuthenticated, session } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserTeams = useCallback(async () => {
    // If no username provided and authenticated, use current user
    const user = username || (isAuthenticated ? session?.user?.id : null);
    
    if (!user) {
      setTeams([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const teamsData = await getUserTeams(user);
      setTeams(teamsData || []);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [username, isAuthenticated, session?.user?.id]);

  useEffect(() => {
    fetchUserTeams();
  }, [fetchUserTeams]);

  return {
    teams,
    loading,
    error,
    refresh: fetchUserTeams
  };
}

/**
 * Hook for fetching members of a team
 * 
 * @param teamId - Team ID to fetch members for
 */
export function useTeamMembers(teamId: string | null) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(!!teamId);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!teamId) {
      setMembers([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const membersData = await getTeamMembers(teamId);
      setMembers(membersData || []);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    refresh: fetchMembers
  };
}

/**
 * Hook for team actions (join, leave, kick members, etc.)
 */
export function useTeamActions() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Join a team
   */
  const join = useCallback(async (teamId: string, password?: string, message?: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await joinTeam(teamId, password, message);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Leave a team
   */
  const leave = useCallback(async (teamId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await leaveTeam(teamId);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Kick a member from a team
   */
  const kick = useCallback(async (teamId: string, userId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await kickTeamMember(teamId, userId);
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return {
    loading,
    error,
    joinTeam: join,
    leaveTeam: leave,
    kickMember: kick
  };
}

/**
 * Hook for managing team join requests
 * 
 * @param teamId - Team ID to fetch join requests for
 */
export function useTeamJoinRequests(teamId: string | null) {
  const { isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(!!teamId && isAuthenticated);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!teamId || !isAuthenticated) {
      setRequests([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const requestsData = await getTeamJoinRequests(teamId);
      setRequests(requestsData || []);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [teamId, isAuthenticated]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  /**
   * Accept a join request
   */
  const acceptRequest = useCallback(async (userId: string) => {
    if (!teamId || !isAuthenticated) {
      throw new Error('Team ID and authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await acceptJoinRequest(teamId, userId);
      if (result) {
        // Refresh the requests list
        fetchRequests();
      }
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [teamId, isAuthenticated, fetchRequests]);

  /**
   * Decline a join request
   */
  const declineRequest = useCallback(async (userId: string) => {
    if (!teamId || !isAuthenticated) {
      throw new Error('Team ID and authentication required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await declineJoinRequest(teamId, userId);
      if (result) {
        // Refresh the requests list
        fetchRequests();
      }
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [teamId, isAuthenticated, fetchRequests]);

  return {
    requests,
    loading,
    error,
    refresh: fetchRequests,
    acceptRequest,
    declineRequest
  };
}