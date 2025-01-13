// tests/scrapers/upcomingMatches.test.js
const mongoose = require('mongoose');
const upcomingMatchScraper = require('../../src/services/scrapers/upcomingMatchScraper');
const Match = require('../../src/models/Match');

describe('Upcoming Matches Scraper', () => {
    jest.setTimeout(30000); // Set timeout to 30 seconds
    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cricket-predictor-test');
    });

    afterAll(async () => {
        // Clean up database and close connection
        await Match.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear matches before each test
        await Match.deleteMany({});
    });

    test('should scrape and save upcoming matches', async () => {
        const matches = await upcomingMatchScraper.scrapeUpcomingMatches();
        
        // Basic validation
        expect(Array.isArray(matches)).toBeTruthy();
        expect(matches.length).toBeGreaterThan(0);

        // Check if matches are saved in database
        const savedMatches = await Match.find({ status: 'UPCOMING' });
        expect(savedMatches.length).toBe(matches.length);

        // Validate match data structure
        const firstMatch = matches[0];
        expect(firstMatch).toHaveProperty('seriesName');
        expect(firstMatch).toHaveProperty('team1');
        expect(firstMatch).toHaveProperty('team2');
        expect(firstMatch).toHaveProperty('venue');
        expect(firstMatch).toHaveProperty('dateText');
    }, 30000); // Increase timeout for web scraping

    test('should handle empty response', async () => {
        // Mock the page.evaluate to return empty array
        jest.spyOn(upcomingMatchScraper, 'scrapeUpcomingMatches').mockImplementationOnce(async () => []);
        
        const matches = await upcomingMatchScraper.scrapeUpcomingMatches();
        expect(Array.isArray(matches)).toBeTruthy();
        expect(matches.length).toBe(0);
    });
});