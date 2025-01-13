const puppeteer = require('puppeteer');
const Team = require('../../../models/Team');
const scraperUtil = require('../../utils/scraper');
const Match = require('../../models/Match');

class UpcomingMatchScraper {
    constructor() {
        this.BASE_URL = 'https://www.cricbuzz.com';
    }

    async scrapeUpcomingMatches() {
        let browser;
        let page;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox']
            });
            page = await browser.newPage();
            await page.goto(`${this.BASE_URL}/cricket-schedule/upcoming-series/all`, { waitUntil: 'networkidle2', timeout: 60000 });

            // Wait for the content to load
            await page.waitForSelector('.cb-col-100.cb-col', { timeout: 60000 });
            console.log('Content loaded successfully');

            const matches = await page.evaluate(() => {
                console.log('Starting to evaluate page content');
                const matches = [];
                
                // Get all date containers
                const dateContainers = document.querySelectorAll('#all-list > div');
                console.log('Found date containers:', dateContainers.length);

                dateContainers.forEach(container => {
                    // Get date header
                    const dateHeader = container.querySelector('.cb-lv-grn-strip');
                    if (!dateHeader) return;

                    const date = dateHeader.textContent.trim();
                    console.log('Processing date:', date);

                    // Get all match details under this date
                    const matchDivs = container.querySelectorAll('.cb-col-100.cb-col');
                    matchDivs.forEach(matchDiv => {
                        try {
                            // Get series name
                            const seriesLink = matchDiv.querySelector('a.cb-col-33');
                            const seriesName = seriesLink ? seriesLink.textContent.trim() : 'Unknown Series';

                            // Get match details
                            const matchDetails = matchDiv.querySelectorAll('.cb-col-67 .cb-col-60');
                            matchDetails.forEach(detail => {
                                const matchLink = detail.querySelector('a');
                                if (!matchLink) return;

                                const teams = matchLink.textContent.split(' vs ');
                                if (teams.length !== 2) return;

                                const venueElement = detail.querySelector('.cb-font-12');
                                const venue = venueElement ? venueElement.textContent.trim() : '';

                                // Get time details
                                const timeDiv = detail.nextElementSibling;
                                const timeSpan = timeDiv ? timeDiv.querySelector('span') : null;
                                const timeInfo = timeSpan ? timeSpan.textContent.trim() : '';

                                const gmtTimeDiv = timeDiv ? timeDiv.querySelector('.cb-font-12') : null;
                                const gmtTime = gmtTimeDiv ? gmtTimeDiv.textContent.trim() : '';

                                matches.push({
                                    date,
                                    seriesName,
                                    team1: teams[0].trim(),
                                    team2: teams[1].split(',')[0].trim(),
                                    venue,
                                    timeInfo,
                                    gmtTime
                                });
                            });
                        } catch (error) {
                            console.error('Error parsing match:', error);
                        }
                    });
                });

                console.log('Found total matches:', matches.length);
                return matches;
            });

            console.log('Page evaluation completed');
            console.log('Total matches found:', matches.length);

            // Process and store matches
            console.log('Processing matches for storage...');
            const processedMatches = [];
            for (const match of matches) {
                try {
                    const matchId = scraperUtil.generateMatchId(match.team1, match.team2, match.date);
                    const [venueName, venueCity] = match.venue.split(',').map(s => s.trim());
                    
                    const matchData = {
                        matchId,
                        seriesName: match.seriesName,
                        matchType: scraperUtil.parseMatchType(match.seriesName),
                        team1: match.team1,
                        team2: match.team2,
                        venue: {
                            name: venueName || '',
                            city: venueCity || ''
                        },
                        startTime: new Date(match.date + ' ' + match.timeInfo),
                        gmtTime: match.gmtTime,
                        status: 'UPCOMING',
                        lastUpdated: new Date()
                    };

                    console.log('Attempting to save match to database:', matchId);
                    const savedMatch = await Match.findOneAndUpdate(
                        { matchId },
                        matchData,
                        { upsert: true, new: true }
                    );
                    console.log('Successfully saved match:', savedMatch._id);
                    
                    processedMatches.push(savedMatch);
                    console.log('Processed match:', match.team1, 'vs', match.team2);
                } catch (error) {
                    console.error('Error processing match:', match, error);
                }
            }

            // After saving matches, scrape squads for each team
            const squads = await this.scrapeSquads(page, matches);

            // Save squads to Team model
            for (const [teamName, squadArray] of Object.entries(squads)) {
                await Team.findOneAndUpdate(
                    { name: teamName },
                    { squad: squadArray },
                    { upsert: true, new: true }
                );
            }

            console.log('Scraping completed successfully');
            return processedMatches;

        } catch (error) {
            console.error('Error during scraping:', error);
            throw error;
        } finally {
            if (page) {
                console.log('Closing page');
                await page.close();
            }
            if (browser) {
                console.log('Closing browser');
                await browser.close();
            }
        }
    }

    async scrapeSquads(page, matches) {
        const squads = {};

        for (const match of matches) {
            try {
                await page.goto(`${this.BASE_URL}${match.url}`, { waitUntil: 'networkidle2', timeout: 60000 });
                await page.click('a[href*="cricket-match-squads"]');
                await page.waitForSelector('.cb-col-100.cb-col', { timeout: 60000 });

                const squadInfo = await page.evaluate(() => {
                    const teams = document.querySelectorAll('.cb-minfo-tm-nm');
                    const squadLists = document.querySelectorAll('.cb-minfo-tm-plyr');

                    const extractPlayers = (squadList) => {
                        const players = [];
                        const playerElements = squadList.querySelectorAll('div');

                        playerElements.forEach(player => {
                            const text = player.textContent.trim();
                            const isCaptain = text.includes('(c)');
                            const isWicketkeeper = text.includes('(wk)');
                            const name = text.replace('(c)', '').replace('(wk)', '').trim();

                            players.push({
                                name,
                                role: '',
                                isCaptain,
                                isWicketkeeper
                            });
                        });

                        return players;
                    };

                    return {
                        team1: {
                            name: teams[0]?.textContent.trim() || '',
                            players: extractPlayers(squadLists[0])
                        },
                        team2: {
                            name: teams[1]?.textContent.trim() || '',
                            players: extractPlayers(squadLists[1])
                        }
                    };
                });

                squads[squadInfo.team1.name] = squadInfo.team1.players;
                squads[squadInfo.team2.name] = squadInfo.team2.players;

                console.log(`Scraped squads for ${squadInfo.team1.name} and ${squadInfo.team2.name}`);
            } catch (error) {
                console.error(`Error scraping squads for match ${match.id}:`, error);
            }
        }

        return squads;
    }
}

module.exports = new UpcomingMatchScraper();