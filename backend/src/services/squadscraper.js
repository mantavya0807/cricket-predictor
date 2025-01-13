// src/services/squadScraper.js
const puppeteer = require('puppeteer');

class SquadScraper {
    constructor() {
        this.BASE_URL = 'https://www.cricbuzz.com';
    }

    async getSquadInfo(matchUrl) {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox']
        });

        try {
            const page = await browser.newPage();
            await page.goto(this.BASE_URL + matchUrl, { waitUntil: 'networkidle0' });
            
            const squadsLink = await page.$('a[href*="cricket-match-squads"]');
            if (!squadsLink) {
                throw new Error('Squads tab not found');
            }
            
            const squadsUrl = await page.evaluate(el => el.href, squadsLink);
            await page.goto(squadsUrl, { waitUntil: 'networkidle0' });

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

            return squadInfo;

        } catch (error) {
            console.error('Error scraping squad info:', error);
            throw error;
        } finally {
            await browser.close();
        }
    }

    async scrapeSquadsForUpcoming() {
        try {
            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox']
            });
            const page = await browser.newPage();
            // Navigate to the upcoming matches page
            await page.goto('https://www.cricbuzz.com/cricket-schedule/upcoming-series/all', { timeout: 90000 });
            
            // Example: click on a match link using a selector
            await page.click('#all-list > div:nth-child(1) ...');

            // Wait for the “Squads” navbar entry, then click
            await page.waitForSelector('.cb-nav-tab[href*="cricket-match-squads"]', { timeout: 90000 });
            await page.click('.cb-nav-tab[href*="cricket-match-squads"]');
            
            // Wait for squad info to load & scrape
            await page.waitForSelector('.cb-col-100.cb-col');
            const squadInfo = await page.evaluate(() => {
                // extract and return squads
                return /* parse squads here */;
            });

            return squadInfo;
        } catch (error) {
            console.error('Error scraping squad info:', error);
            throw error;
        }
    }
}

module.exports = SquadScraper;
