// src/services/scrapers/squadScraper.js
const puppeteer = require('puppeteer');
const Team = require('../../models/Team');
const Match = require('../../models/Match');
const Player = require('../../models/Player');

class SquadScraper {
    constructor() {
        this.BASE_URL = 'https://www.cricbuzz.com';
    }

    convertTeamName(name) {
        if (!name) return '';
        // Remove spaces and convert to uppercase
        let cleanName = name.replace(/\s+/g, '').toUpperCase();
        
        // Common words to remove
        const wordsToRemove = ['TEAM', 'CRICKET', 'NATIONAL', 'THE'];
        wordsToRemove.forEach(word => {
            cleanName = cleanName.replace(word, '');
        });

        // Common abbreviations
        const abbreviations = {
            'INDIA': 'IND',
            'WESTINDIES': 'WI',
            'BANGLADESH': 'BAN',
            'AUSTRALIA': 'AUS',
            'SRILANKA': 'SL',
            'NEWZEALAND': 'NZ',
            'SOUTHAFRICA': 'SA',
            'UNITEDSTATES': 'USA',
            'ENGLAND': 'ENG',
            'PAKISTAN': 'PAK',
            'MALAYSIA': 'MLS',
            'CANADA': 'CAN',
            // Add more as needed
        };

        // Apply abbreviations
        Object.entries(abbreviations).forEach(([full, abbr]) => {
            cleanName = cleanName.replace(full, abbr);
        });

        // Add appropriate suffixes
        if (cleanName.includes('WOMEN') && cleanName.includes('U19')) {
            cleanName = cleanName.replace('WOMEN', '').replace('U19', 'WU19');
        } else if (cleanName.includes('WOMEN')) {
            cleanName = cleanName.replace('WOMEN', 'W');
        } else if (cleanName.includes('U19')) {
            cleanName += 'U19';
        }

        console.log('Team name conversion:', {
            original: name,
            cleaned: cleanName
        });

        return cleanName;
    }

    processRole(role, isWicketkeeper) {
        if (!role && isWicketkeeper) return 'Wicket Keeper';
        if (!role) return 'Unknown';

        const roleText = role.toUpperCase();
        
        if (isWicketkeeper || roleText.includes('WK') || roleText.includes('WICKET')) {
            return 'Wicket Keeper';
        }

        if (roleText.includes('BOWL') && roleText.includes('ALL')) {
            return 'All-Rounder';
        }

        if (roleText.includes('BAT') && roleText.includes('ALL')) {
            return 'All-Rounder';
        }

        if (roleText.includes('BOWL')) return 'Bowler';
        if (roleText.includes('BAT')) return 'Batsman';
        if (roleText.includes('ALL')) return 'All-Rounder';

        return role; // Keep original if no match
    }

    async scrapeSquadsForUpcoming() {
        let browser;
        try {
            console.log('Starting to scrape squads for upcoming matches...');
            const upcomingMatches = await Match.find({ status: 'UPCOMING' });
            console.log(`Found ${upcomingMatches.length} upcoming matches to scrape squads for`);

            browser = await puppeteer.launch({
                headless: false,
                args: ['--no-sandbox']
            });

            for (const match of upcomingMatches) {
                try {
                    console.log(`Processing match: ${match.team1} vs ${match.team2}`);
                    if (!match.matchUrl) {
                        console.log('No matchUrl found, skipping...');
                        continue;
                    }

                    const page = await browser.newPage();
                    console.log(`Navigating to: ${match.matchUrl}`);
                    await page.goto(match.matchUrl, { waitUntil: 'networkidle0', timeout: 60000 });

                    // Wait for and click the Squads tab
                    console.log('Waiting for squad tab...');
                    await page.waitForSelector('nav.cb-nav-bar a[href*="cricket-match-squads"]', { timeout: 30000 });
                    console.log('Found squad tab, clicking...');
                    await page.click('nav.cb-nav-bar a[href*="cricket-match-squads"]');
                    
                    // Wait for squad content to load
                    console.log('Waiting for squad content to load...');
                    await page.waitForSelector('.cb-col.cb-col-100.cb-teams-hdr', { timeout: 30000 });

                    // Extract team names first
                    const teamNames = await page.evaluate(() => ({
                        team1: document.querySelector('.cb-team1')?.textContent.trim() || '',
                        team2: document.querySelector('.cb-team2')?.textContent.trim() || ''
                    }));

                    // Convert team names
                    const team1Name = this.convertTeamName(teamNames.team1);
                    const team2Name = this.convertTeamName(teamNames.team2);

                    console.log('Team names:', { 
                        original: { team1: teamNames.team1, team2: teamNames.team2 },
                        converted: { team1: team1Name, team2: team2Name }
                    });

                    // Extract player data
                    const playerData = await page.evaluate(() => {
                        const extractPlayers = (selector) => {
                            return Array.from(document.querySelectorAll(selector)).map(card => {
                                const nameDiv = card.querySelector('div[class*="player-name"] div');
                                if (!nameDiv) return null;

                                const text = nameDiv.textContent.trim();
                                const roleSpan = nameDiv.querySelector('span.cb-font-12');
                                const role = roleSpan ? roleSpan.textContent.trim() : '';
                                const isCaptain = text.includes('(C)');
                                const isWicketkeeper = text.includes('(WK)');
                                const name = text.replace(/\(C\)|\(WK\)/g, '').replace(role, '').trim();

                                return { name, role, isCaptain, isWicketkeeper };
                            }).filter(Boolean);
                        };

                        return {
                            team1: extractPlayers('.cb-col-50.cb-play11-lft-col .cb-player-card-left'),
                            team2: extractPlayers('.cb-col-50.cb-play11-rt-col .cb-player-card-right')
                        };
                    });

                    // Process and store team data
                    for (const [teamKey, teamName] of [[team1Name, teamData.team1], [team2Name, teamData.team2]]) {
                        const processedPlayers = teamData[teamKey].map(player => ({
                            name: player.name,
                            role: this.processRole(player.role, player.isWicketkeeper),
                            isCaptain: player.isCaptain,
                            isWicketkeeper: player.isWicketkeeper,
                            lastUpdated: new Date()
                        }));

                        await Team.findOneAndUpdate(
                            { name: teamName },
                            { 
                                name: teamName,
                                squad: processedPlayers,
                                lastUpdated: new Date()
                            },
                            { upsert: true }
                        );
                        console.log(`Updated squad for ${teamName}`);
                    }

                    await page.close();
                } catch (error) {
                    console.error(`Error processing match: ${match.matchId}`, error);
                }
            }

            console.log('Completed scraping squads for all matches');
            return await Team.find({});

        } catch (error) {
            console.error('Error in scrapeSquadsForUpcoming:', error);
            throw error;
        } finally {
            if (browser) {
                await browser.close();
                console.log('Closed browser');
            }
        }
    }

    // Method to get squad info for a specific match
    async getSquadInfo(matchUrl) {
        let browser;
        let page;
        try {
            console.log(`Getting squad info for match URL: ${matchUrl}`);
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox']
            });
            
            page = await browser.newPage();
            await page.goto(matchUrl, { waitUntil: 'networkidle0', timeout: 60000 });

            // Wait for and click the Squads tab
            console.log('Waiting for squad tab...');
            await page.waitForSelector('nav.cb-nav-bar a[href*="cricket-match-squads"]', { timeout: 30000 });
            console.log('Found squad tab, clicking...');
            await page.click('nav.cb-nav-bar a[href*="cricket-match-squads"]');

            // Wait for squad content to load
            console.log('Waiting for squad content to load...');
            await page.waitForSelector('.cb-col.cb-col-100.cb-teams-hdr', { timeout: 30000 });

            // Get team names and convert them
            const teamNames = await page.evaluate(() => ({
                team1: document.querySelector('.cb-team1')?.textContent.trim() || '',
                team2: document.querySelector('.cb-team2')?.textContent.trim() || ''
            }));

            const team1Name = this.convertTeamName(teamNames.team1);
            const team2Name = this.convertTeamName(teamNames.team2);

            // Extract player data
            const playerData = await page.evaluate(() => {
                const extractPlayers = (selector) => {
                    return Array.from(document.querySelectorAll(selector)).map(card => {
                        const nameDiv = card.querySelector('div[class*="player-name"] div');
                        if (!nameDiv) return null;

                        const text = nameDiv.textContent.trim();
                        const roleSpan = nameDiv.querySelector('span.cb-font-12');
                        const role = roleSpan ? roleSpan.textContent.trim() : '';
                        const isCaptain = text.includes('(C)');
                        const isWicketkeeper = text.includes('(WK)');
                        const name = text.replace(/\(C\)|\(WK\)/g, '').replace(role, '').trim();

                        return { name, role, isCaptain, isWicketkeeper };
                    }).filter(Boolean);
                };

                return {
                    team1: extractPlayers('.cb-col-50.cb-play11-lft-col .cb-player-card-left'),
                    team2: extractPlayers('.cb-col-50.cb-play11-rt-col .cb-player-card-right')
                };
            });

            // Process players and return data
            const processTeamData = (players) => ({
                players: players.map(player => ({
                    name: player.name,
                    role: this.processRole(player.role, player.isWicketkeeper),
                    isCaptain: player.isCaptain,
                    isWicketkeeper: player.isWicketkeeper
                }))
            });

            const squadData = {
                team1: { name: team1Name, ...processTeamData(playerData.team1) },
                team2: { name: team2Name, ...processTeamData(playerData.team2) }
            };

            console.log('Successfully extracted squad data');
            return squadData;

        } catch (error) {
            console.error('Error in getSquadInfo:', error);
            throw error;
        } finally {
            if (page) await page.close();
            if (browser) await browser.close();
        }
    }
}

module.exports = new SquadScraper();