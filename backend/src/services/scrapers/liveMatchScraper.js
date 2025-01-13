// src/services/scrapers/liveMatchScraper.js
const scraperUtil = require('../../utils/scraper');
const Match = require('../../models/Match');

class LiveMatchScraper {
    constructor() {
        this.BASE_URL = 'https://www.cricbuzz.com/cricket-match/live-scores';
    }

    async scrapeLiveMatches() {
        try {
            const page = await scraperUtil.getPage(this.BASE_URL);
            
            // First check if there are no matches
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
                        // Get series name and match ID
                        const seriesHeader = matchElem.querySelector('.cb-lv-scr-mtch-hdr a');
                        const seriesName = seriesHeader ? seriesHeader.textContent.trim() : 'Unknown Series';

                        const matchLink = matchElem.querySelector('a.cb-lv-scrs-well');
                        const matchUrl = matchLink ? matchLink.href : '';
                        const matchId = matchUrl.split('/').pop();

                        // Teams and scores
                        const team1Elem = matchElem.querySelector('.cb-hmscg-bwl-txt .cb-hmscg-tm-nm');
                        const team2Elem = matchElem.querySelector('.cb-hmscg-bat-txt .cb-hmscg-tm-nm');
                        const team1ScoreElem = matchElem.querySelector('.cb-hmscg-bwl-txt .cb-ovr-flo');
                        const team2ScoreElem = matchElem.querySelector('.cb-hmscg-bat-txt .cb-ovr-flo');

                        const team1 = team1Elem ? team1Elem.textContent.trim() : '';
                        const team2 = team2Elem ? team2Elem.textContent.trim() : '';
                        const team1Score = team1ScoreElem ? team1ScoreElem.textContent.trim() : '';
                        const team2Score = team2ScoreElem ? team2ScoreElem.textContent.trim() : '';

                        // Match state and result
                        const stateElem = matchElem.querySelector('.cb-text-live') ||
                                        matchElem.querySelector('.cb-text-complete');
                        const matchState = stateElem ? 
                            (stateElem.classList.contains('cb-text-complete') ? 'COMPLETED' : 'LIVE') : 'LIVE';
                        const result = stateElem ? stateElem.textContent.trim() : '';

                        // Venue
                        const venueElem = matchElem.querySelector('.cb-font-12');
                        const venue = venueElem ? venueElem.textContent.trim() : '';
                        const [venueName, venueCity] = venue.split(',').map(s => s.trim());

                        matches.push({
                            matchId,
                            seriesName,
                            team1,
                            team2,
                            team1Score,
                            team2Score,
                            matchState,
                            result,
                            venue: { name: venueName || '', city: venueCity || '', country: '' }
                        });
                    } catch (error) {
                        console.error('Error parsing live match element:', error);
                    }
                });

                return matches;
            });

            await page.close();

            // Process and store matches
            const updatedMatches = [];
            for (const match of matches) {
                const matchData = {
                    matchId: match.matchId,
                    seriesName: match.seriesName,
                    matchType: scraperUtil.parseMatchType(match.seriesName),
                    team1: match.team1,
                    team2: match.team2,
                    venue: match.venue,
                    currentScore: {
                        team1Score: this.parseScore(match.team1Score),
                        team2Score: this.parseScore(match.team2Score),
                        battingTeam: '', 
                        currentState: match.result
                    },
                    status: match.matchState,
                    result: match.result,
                    lastUpdated: new Date()
                };

                // Update or create match in Match collection
                await Match.findOneAndUpdate(
                    { matchId: match.matchId },
                    matchData,
                    { upsert: true, new: true }
                );

                updatedMatches.push(matchData);
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
            const parts = scoreText.split(' ');
            const scorePart = parts[0];
            
            score.declared = scoreText.toLowerCase().includes('d');
            
            const [runs, wickets] = scorePart.split('-').map(num => parseInt(num));
            score.runs = runs || 0;
            score.wickets = wickets || 0;
            
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