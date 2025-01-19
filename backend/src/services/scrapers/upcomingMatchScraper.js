const puppeteer = require('puppeteer');
const Team = require('../../models/Team');
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
            console.log('Starting to scrape upcoming matches...');
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox']
            });
            page = await browser.newPage();

            // Navigate to upcoming matches page
            console.log('Navigating to upcoming matches page...');
            await page.goto(`${this.BASE_URL}/cricket-schedule/upcoming-series/all`, { 
                waitUntil: 'networkidle2', 
                timeout: 60000 
            });

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

                                // Get the match URL
                                const baseMatchUrl = matchLink.getAttribute('href');
                                const matchUrl = baseMatchUrl ? `https://www.cricbuzz.com${baseMatchUrl}` : '';

                                matches.push({
                                    date,
                                    seriesName,
                                    team1: teams[0].trim(),
                                    team2: teams[1].split(',')[0].trim(),
                                    venue,
                                    timeInfo,
                                    gmtTime,
                                    matchUrl
                                });
                            });
                        } catch (error) {
                            console.error('Error parsing match:', error);
                        }
                    });
                });

                return matches;
            });

            console.log(`Found ${matches.length} upcoming matches`);

            // Process and store matches
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
                        lastUpdated: new Date(),
                        matchUrl: match.matchUrl
                    };

                    console.log(`Saving match: ${match.team1} vs ${match.team2}`);
                    const savedMatch = await Match.findOneAndUpdate(
                        { matchId },
                        matchData,
                        { upsert: true, new: true }
                    );
                    
                    processedMatches.push(savedMatch);
                } catch (error) {
                    console.error('Error processing match:', match, error);
                }
            }

            console.log(`Successfully processed ${processedMatches.length} matches`);
            return processedMatches;

        } catch (error) {
            console.error('Error during upcoming matches scraping:', error);
            throw error;
        } finally {
            if (page) await page.close();
            if (browser) await browser.close();
            console.log('Closed browser');
        }
    }
}

module.exports = new UpcomingMatchScraper();