// tests/scrapers/liveMatches.test.js
const mongoose = require('mongoose');
const liveMatchScraper = require('../../src/services/scrapers/liveMatchScraper');
const Match = require('../../src/models/Match');

describe('Live Matches Scraper', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cricket-predictor-test');
    });

    afterAll(async () => {
        await Match.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Match.deleteMany({});
    });

    test('should parse score correctly', () => {
        const scraper = liveMatchScraper;
        
        // Test various score formats
        expect(scraper.parseScore('346-8 d')).toEqual({
            runs: 346,
            wickets: 8,
            overs: 0,
            declared: true
        });

        expect(scraper.parseScore('82-3 (11.3 Ovs)')).toEqual({
            runs: 82,
            wickets: 3,
            overs: 11.3,
            declared: false
        });

        expect(scraper.parseScore(null)).toBeNull();
    });

    test('should scrape and save live matches', async () => {
        const matches = await liveMatchScraper.scrapeLiveMatches();
        
        // Basic validation
        expect(Array.isArray(matches)).toBeTruthy();
        
        // Check database
        const savedMatches = await Match.find({ status: 'LIVE' });
        expect(savedMatches.length).toBe(matches.length);

        if (matches.length > 0) {
            const firstMatch = matches[0];
            expect(firstMatch).toHaveProperty('currentScore');
            expect(firstMatch.currentScore).toHaveProperty('team1Score');
            expect(firstMatch.currentScore).toHaveProperty('team2Score');
        }
    }, 30000);

    test('should update existing matches', async () => {
        // First scrape
        const initialMatches = await liveMatchScraper.scrapeLiveMatches();
        
        // Wait a bit and scrape again
        await new Promise(resolve => setTimeout(resolve, 5000));
        const updatedMatches = await liveMatchScraper.scrapeLiveMatches();

        // Check that matches were updated, not duplicated
        const allMatches = await Match.find({ status: 'LIVE' });
        expect(allMatches.length).toBe(updatedMatches.length);
    }, 40000);
});