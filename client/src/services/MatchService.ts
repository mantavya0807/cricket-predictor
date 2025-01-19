import axios from 'axios';
import { Match } from '../types';


const API_BASE_URL = 'http://localhost:5000/api'; // Update as needed

const MatchService = {
  getLiveMatches: async (): Promise<Match[]> => {
    const response = await axios.get(`${API_BASE_URL}/matches/live`);
    return response.data;
  },
  getUpcomingMatches: async (): Promise<Match[]> => {
    const response = await axios.get(`${API_BASE_URL}/matches/upcoming`);
    return response.data;
  },
  getSquad: async (matchId: string): Promise<Squad> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/matches/${matchId}/squad`);
      return response.data;
    } catch (error) {
      console.error('Error fetching squad:', error);
      throw error;
    }
  },
  scrapeUpcomingSquads: async (): Promise<void> => {
    await axios.get(`${API_BASE_URL}/squads/scrape/upcoming`);
  },
};

export default MatchService;