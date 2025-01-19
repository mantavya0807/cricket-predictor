// src/services/api.ts
import axios from 'axios';
import type { Match } from '../types/match';
import type { Player } from '../types/player';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const MatchService = {
    getLiveMatches: async (): Promise<Match[]> => {
        const response = await axios.get(`${API_BASE_URL}/matches/live`);
        return response.data;
    },

    getUpcomingMatches: async (): Promise<Match[]> => {
        const response = await axios.get(`${API_BASE_URL}/matches/upcoming`);
        return response.data;
    },

    getMatchSquad: async (matchId: string) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/players/match/${matchId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching squad:', error);
            throw error;
        }
    },

    refreshMatches: async (): Promise<void> => {
        await axios.post(`${API_BASE_URL}/matches/refresh`);
    }
};

export const PlayerService = {
    getPlayerDetails: async (playerId: string): Promise<Player> => {
        const response = await axios.get(`${API_BASE_URL}/players/${playerId}`);
        return response.data;
    },

    getPlayersByRole: async (role: string): Promise<Player[]> => {
        const response = await axios.get(`${API_BASE_URL}/players/role/${role}`);
        return response.data;
    }
};

export const handleApiError = (error: any): string => {
    if (axios.isAxiosError(error)) {
        if (!error.response) {
            return 'Unable to reach server. Please check your connection.';
        }
        return error.response.data?.message || 'An error occurred while fetching data.';
    }
    return 'An unexpected error occurred.';
};