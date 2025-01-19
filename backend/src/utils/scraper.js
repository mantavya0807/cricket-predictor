// src/utils/scraper.js
const puppeteer = require('puppeteer');

class ScraperUtil {
    constructor() {
        this.browser = null;

        // Expanded series mapping for match types
        this.seriesTypeMap = {
            // International Men's Tests/ODIs/T20s
            'tour of': 'TEST',
            'test series': 'TEST',
            'odi series': 'ODI',
            't20i series': 'T20',
            'world cup': 'ODI',
            'icc champion trophy': 'ODI',
            'icc t20 world cup': 'T20',
            'the ashes': 'TEST',
            'bbva america': 'ODI',
            'commonwealth bank series': 'ODI',
            'pink ball test': 'TEST',
            'freedom series': 'TEST',
            'china tour': 'TEST',
            'australia tour': 'TEST',
            'india tour': 'TEST',
            'south africa tour': 'TEST',
            'new zealand tour': 'TEST',
            'west indies tour': 'TEST',
            'sri lanka tour': 'TEST',
            'pakistan tour': 'TEST',
            'afghanistan tour': 'TEST',
            'bangladesh tour': 'TEST',
            // International Women's Tests/ODIs/T20s
            'womens ashes': 'TEST',
            'women\'s test series': 'TEST',
            'women\'s odi series': 'ODI',
            'women\'s t20i series': 'T20',
            'icc women\'s world cup': 'ODI',
            'icc women\'s t20 world cup': 'T20',
            'china women\'s tour': 'TEST',
            'australia women\'s tour': 'TEST',
            'england women\'s tour': 'TEST',
            'india women\'s tour': 'TEST',
            'new zealand women\'s tour': 'TEST',
            'south africa women\'s tour': 'TEST',
            'west indies women\'s tour': 'TEST',
            'pakistan women\'s tour': 'TEST',
            'sri lanka women\'s tour': 'TEST',
            'bangladesh women\'s tour': 'TEST',
            // Domestic Men's T20 Leagues
            'big bash': 'T20',
            'ipl': 'T20',
            'pakistan super league': 'T20',
            'sa20': 'T20',
            'international league t20': 'T20',
            'bangladesh premier league': 'T20',
            'caribbean premier league': 'T20',
            'hundred': 'T20',
            'super smash': 'T20',
            'vitality blast': 'T20',
            'lanka premier league': 'T20',
            'null': 'T20', // Replace 'null' with actual league names as needed
            't20 blast': 'T20',
            'mt20': 'T20',
            'mitre twenty20': 'T20',
            'regional t20 league': 'T20',
            // Domestic Women's T20 Leagues
            'wpl': 'T20',
            'the hundred women\'s competition': 'T20',
            'womens t20 league': 'T20',
            'super she': 'T20',
            'kpl women\'s league': 'T20',
            // Domestic Men's One Day
            'vijay hazare': 'ODI',
            'one-day cup': 'ODI',
            'the marsh cup': 'ODI',
            'royal one day cup': 'ODI',
            'sylhet one day league': 'ODI',
            'sapporo one day series': 'ODI',
            'sri lanka domestic one day': 'ODI',
            // Domestic Women's One Day
            'womens one day league': 'ODI',
            'royal womens one day cup': 'ODI',
            // Domestic Men's Tests/First-Class
            'ranji trophy': 'TEST',
            'sheffield shield': 'TEST',
            'county championship': 'TEST',
            'plunket shield': 'TEST',
            'interstate cricket league': 'TEST',
            'pura cup': 'TEST',
            'bob white trophy': 'TEST',
            'hampshire county cricket league': 'TEST',
            'northern cricket league': 'TEST',
            // Domestic Women's Tests/First-Class
            'womens first-class league': 'TEST',
            'sheffield shield women\'s': 'TEST',
            'ranji trophy women\'s': 'TEST',
            // Miscellaneous/Other Leagues
            'csa four-day series': 'TEST',
            'revani t20 league': 'T20',
            'mashujaa t20 league': 'T20',
            'logan t20 league': 'T20',
            'senior t20 league': 'T20',
            'amrit t20 league': 'T20',
            'eagles t20 league': 'T20',
            // Add more series as needed
        };
    }

    async initialize() {
        if (!this.browser) {
            console.log('Launching browser...');
            this.browser = await puppeteer.launch({
                headless: false, // Show browser window
                defaultViewport: null, // Full screen
                slowMo: 100, // Slow down operations to see what's happening
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--window-size=1920,1080',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu'
                ],
                timeout: 60000 // Increase timeout to 60 seconds
            });
            console.log('Browser launched successfully');
        }
    }

    async getPage(url) {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        console.log('Creating new page...');
        await page.goto(url, { waitUntil: 'networkidle0' });
        console.log('Navigation complete');
        return page;
    }

    parseMatchType(seriesName) {
        if (/Test/i.test(seriesName)) return 'TEST';
        if (/ODI/i.test(seriesName)) return 'ODI';
        if (/T20/i.test(seriesName)) return 'T20';
        return 'OTHER';
    }

    generateMatchId(team1, team2, date) {
        // Simple ID generation logic
        return `${team1.replace(/\s+/g, '-').toLowerCase()}-${team2.replace(/\s+/g, '-').toLowerCase()}-${new Date(date).getTime()}`;
    }

    async close() {
        // Implement if there's a shared browser instance
    }
}

module.exports = new ScraperUtil();
