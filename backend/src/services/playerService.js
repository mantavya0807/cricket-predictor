// src/services/playerService.js
const Player = require('../models/Player');
const Match = require('../models/Match');
const Team = require('../models/Team');
const SquadScraper = require('./scrapers/squadScraper');

class PlayerService {
    constructor() {
        this.squadScraper = SquadScraper;
        this.cacheTimeout = 12 * 60 * 60 * 1000; // 12 hours
    }

    async getPlayerDetails(playerId) {
        try {
            const player = await Player.findOne({ playerId });
            if (!player) {
                throw new Error('Player not found');
            }
            return player;
        } catch (error) {
            console.error(`Error fetching player details: ${error}`);
            throw error;
        }
    }

    async getPlayersByRole(role) {
        try {
            const players = await Player.find({
                'personalInfo.role': role
            });
            return players;
        } catch (error) {
            console.error(`Error fetching players by role: ${error}`);
            throw error;
        }
    }

    async getPlayersForMatch(matchId) {
        try {
            console.log(`Fetching squad for match: ${matchId}`);
            const match = await Match.findOne({ matchId });
            
            if (!match) {
                throw new Error('Match not found');
            }

            console.log('Match found:', {
                team1: match.team1,
                team2: match.team2,
                matchUrl: match.matchUrl
            });

            // First, try to get the squad info from the match URL
            let squadInfo;
            try {
                console.log('Getting squad info from match URL...');
                squadInfo = await this.squadScraper.getSquadInfo(match.matchUrl);
                console.log('Squad info obtained:', {
                    team1: squadInfo.team1.name,
                    team2: squadInfo.team2.name,
                    team1Players: squadInfo.team1.players.length,
                    team2Players: squadInfo.team2.players.length
                });
            } catch (error) {
                console.error('Error getting squad info:', error);
                throw error;
            }

            // Try to find teams in database
            const [team1Data, team2Data] = await Promise.all([
                Team.findOne({ name: squadInfo.team1.name }),
                Team.findOne({ name: squadInfo.team2.name })
            ]);

            console.log('Team data found:', {
                team1Found: team1Data?.name,
                team2Found: team2Data?.name,
                team1SquadSize: team1Data?.squad?.length || 0,
                team2SquadSize: team2Data?.squad?.length || 0
            });

            // Update or create teams with the latest squad info
            const updatedTeams = await Promise.all([
                // Update or create team1
                Team.findOneAndUpdate(
                    { name: squadInfo.team1.name },
                    { 
                        name: squadInfo.team1.name,
                        squad: squadInfo.team1.players.map(player => ({
                            ...player,
                            role: this.squadScraper.processRole(player.role, player.isWicketkeeper)
                        })),
                        lastUpdated: new Date()
                    },
                    { upsert: true, new: true }
                ),
                // Update or create team2
                Team.findOneAndUpdate(
                    { name: squadInfo.team2.name },
                    { 
                        name: squadInfo.team2.name,
                        squad: squadInfo.team2.players.map(player => ({
                            ...player,
                            role: this.squadScraper.processRole(player.role, player.isWicketkeeper)
                        })),
                        lastUpdated: new Date()
                    },
                    { upsert: true, new: true }
                )
            ]);

            // Return processed squad data
            return {
                team1: {
                    name: match.team1,
                    players: updatedTeams[0].squad.map(player => ({
                        ...player,
                        role: this.squadScraper.processRole(player.role, player.isWicketkeeper)
                    }))
                },
                team2: {
                    name: match.team2,
                    players: updatedTeams[1].squad.map(player => ({
                        ...player,
                        role: this.squadScraper.processRole(player.role, player.isWicketkeeper)
                    }))
                }
            };
        } catch (error) {
            console.error(`Error fetching players for match: ${error}`);
            throw error;
        }
    }

    needsUpdate(teamData) {
        if (!teamData || !teamData.lastUpdated) return true;
        const timeSinceUpdate = Date.now() - new Date(teamData.lastUpdated).getTime();
        return timeSinceUpdate > this.cacheTimeout;
    }

    async updatePlayer(playerId, playerData) {
        try {
            const updatedPlayer = await Player.findOneAndUpdate(
                { playerId },
                playerData,
                { new: true, runValidators: true }
            );
            return updatedPlayer;
        } catch (error) {
            console.error(`Error updating player: ${error}`);
            throw error;
        }
    }

    processRole(role, isWicketkeeper) {
        return this.squadScraper.processRole(role, isWicketkeeper);
    }
}

module.exports = new PlayerService();