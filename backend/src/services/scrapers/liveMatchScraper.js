const scraperUtil = require('../../utils/scraper');
const Match = require('../../models/Match');

class LiveMatchScraper {
    constructor() {
        this.BASE_URL = 'https://www.cricbuzz.com/cricket-match/live-scores';
    }

    async scrapeLiveMatches() {
        try {
            const page = await scraperUtil.getPage(this.BASE_URL);
            
            // Check for no matches first
            const noMatches = await page.evaluate(() => {
                const noMatchesDiv = document.querySelector('.cb-font-16.cb-col-rt');
                return noMatchesDiv?.textContent.includes('There are no matches at the moment');
            });

            if (noMatches) {
                console.log('No live matches currently in progress');
                await page.close();
                return [];
            }
            
            const matches = await page.evaluate(() => {
                const matchElements = document.querySelectorAll('.cb-mtch-lst.cb-col.cb-col-100.cb-tms-itm');
                const matches = [];

                matchElements.forEach(matchElem => {
                    try {
                        // Get series name
                        const seriesHeader = matchElem.closest('.cb-plyr-tbody').querySelector('.cb-lv-grn-strip');
                        const seriesName = seriesHeader ? seriesHeader.textContent.trim() : 'Unknown Series';

                        // Get match details
                        const matchTitleElem = matchElem.querySelector('.cb-lv-scr-mtch-hdr');
                        const matchTitle = matchTitleElem?.querySelector('a')?.textContent.trim() || '';
                        const matchDesc = matchTitleElem?.querySelector('.text-gray')?.textContent.trim() || '';

                        // Get venue and time
                        const venueTimeElem = matchElem.querySelector('.text-gray');
                        const venueTimeText = venueTimeElem?.textContent.trim() || '';
                        const [_, time, venue] = venueTimeText.match(/(\d+:\d+ [AP]M) at (.+)/) || ['', '', ''];

                        // Get match ID from URL
                        const matchLink = matchElem.querySelector('a.cb-lv-scrs-well');
                        const matchUrl = matchLink?.href || '';
                        const matchId = matchUrl.split('/').pop();

                        // Get teams and scores
                        const scoreWell = matchElem.querySelector('.cb-scr-wll-chvrn');
                        const team1Data = scoreWell?.querySelector('.cb-hmscg-bwl-txt');
                        const team2Data = scoreWell?.querySelector('.cb-hmscg-bat-txt');

                        const team1 = {
                            name: team1Data?.querySelector('.cb-hmscg-tm-nm')?.textContent.trim() || '',
                            score: team1Data?.querySelector('.cb-ovr-flo:last-child')?.textContent.trim() || ''
                        };

                        const team2 = {
                            name: team2Data?.querySelector('.cb-hmscg-tm-nm')?.textContent.trim() || '',
                            score: team2Data?.querySelector('.cb-ovr-flo:last-child')?.textContent.trim() || ''
                        };

                        // Get match status/state
                        const statusElem = scoreWell?.querySelector('.cb-text-live') || 
                                        scoreWell?.querySelector('.cb-text-complete');
                        const status = statusElem ? 
                            statusElem.classList.contains('cb-text-complete') ? 'COMPLETED' : 'LIVE'
                            : 'LIVE';

                        const result = statusElem?.textContent.trim() || '';

                        matches.push({
                            matchId,
                            seriesName,
                            matchTitle,
                            matchDesc,
                            venue: venue?.trim() || '',
                            time: time?.trim() || '',
                            team1,
                            team2,
                            status,
                            result
                        });
                    } catch (error) {
                        console.error('Error parsing match element:', error);
                    }
                });

                return matches;
            });

            await page.close();

            // Process and store matches
            const updatedMatches = [];
            for (const match of matches) {
                const [venue, city] = (match.venue || '').split(',').map(s => s.trim());
                
                const matchData = {
                    matchId: match.matchId,
                    seriesName: match.seriesName,
                    matchType: scraperUtil.parseMatchType(match.seriesName),
                    team1: match.team1.name,
                    team2: match.team2.name,
                    venue: {
                        name: venue || '',
                        city: city || '',
                        country: '' // Could be enhanced with a lookup table
                    },
                    currentScore: {
                        team1Score: this.parseScore(match.team1.score),
                        team2Score: this.parseScore(match.team2.score),
                        battingTeam: match.team2.name,  // Assuming team2 is batting based on HTML structure
                        currentState: match.result
                    },
                    status: match.status,
                    result: match.result,
                    lastUpdated: new Date()
                };

                // Update or create match
                const updatedMatch = await Match.findOneAndUpdate(
                    { matchId: match.matchId },
                    matchData,
                    { upsert: true, new: true }
                );

                updatedMatches.push(updatedMatch);
            }

            return updatedMatches;
        } catch (error) {
            console.error('Error scraping live matches:', error);
            throw error;
        }
    }

    parseScore(scoreText) {
        if (!scoreText) return null;
        
        const score = {
            runs: 0,
            wickets: 0,
            overs: 0,
            declared: false
        };

        try {
            // Handle formats like "346-8 d" or "82-3 (11.3 Ovs)"
            const parts = scoreText.split(' ');
            const scorePart = parts[0]; // "346-8" or "82-3"
            
            // Check for declaration
            score.declared = scoreText.toLowerCase().includes('d');
            
            // Parse runs and wickets
            const [runs, wickets] = scorePart.split('-').map(num => parseInt(num));
            score.runs = runs || 0;
            score.wickets = wickets || 0;
            
            // Parse overs if available
            if (parts.length > 1) {
                const oversMatch = scoreText.match(/\(([\d.]+)/);
                if (oversMatch) {
                    score.overs = parseFloat(oversMatch[1]);
                }
            }
            
            return score;
        } catch (error) {
            console.error('Error parsing score:', scoreText, error);
            return null;
        }
    }
}

module.exports = new LiveMatchScraper();