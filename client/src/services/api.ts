// src/services/api.ts
import axios, { AxiosError } from 'axios';
import { Match } from '../types/match';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
    // Retry configuration
    validateStatus: (status) => status < 500, // Retry only on network or 500+ errors
});

// Add retry interceptor
api.interceptors.response.use(undefined, async (err: AxiosError) => {
    const { config } = err;
    if (!config || !config.retry) {
        return Promise.reject(err);
    }

    config.retry -= 1;
    if (config.retry === 0) {
        return Promise.reject(err);
    }

    // Exponential back-off
    const backoff = new Promise(resolve => {
        setTimeout(() => {
            resolve(null);
        }, config.retryDelay || 1000);
    });

    await backoff;
    return api(config);
});

// Add request interceptor to add retry config to all requests
api.interceptors.request.use(
    (config) => {
        config.retry = 3; // Number of retries
        config.retryDelay = 1000; // Start with 1s delay
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const MatchService = {
    getLiveMatches: async (): Promise<Match[]> => {
        try {
            // First check if API is available
            await api.get('/health');
            const response = await api.get('/matches/live');
            return response.data;
        } catch (error) {
            console.error('Error fetching live matches:', error);
            // Return empty array instead of throwing
            return [];
        }
    },

    getUpcomingMatches: async (): Promise<Match[]> => {
        try {
            await api.get('/health');
            const response = await api.get('/matches/upcoming');
            return response.data;
        } catch (error) {
            console.error('Error fetching upcoming matches:', error);
            return [];
        }
    },

    getMatchDetails: async (matchId: string): Promise<Match | null> => {
        try {
            const response = await api.get(`/matches/${matchId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching match details:', error);
            return null;
        }
    },

    refreshMatches: async (): Promise<void> => {
        try {
            await api.post('/matches/refresh');
        } catch (error) {
            console.error('Error refreshing matches:', error);
            throw error;
        }
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