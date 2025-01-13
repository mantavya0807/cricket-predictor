// scripts/test-scraping.js
require('dotenv').config();
const mongoose = require('mongoose');
const upcomingMatchScraper = require('../src/services/scrapers/upcomingMatchScraper');
const liveMatchScraper = require('../src/services/scrapers/liveMatchScraper');
const enhancedMatchScraper = require('../src/services/scrapers/enhancedMatchScraper');
const scraperUtil = require('../src/utils/scraper');
const Match = require('../src/models/Match');
const DetailedMatch = require('../src/models/DetailedMatch');

async function connectToDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cricket-predictor', {
            serverSelectionTimeoutMS: 5000,
            family: 4,
        });
        console.log('Successfully connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

async function verifyDatabaseContents() {
    console.log('\nVerifying database contents...');
    
    // Check basic matches
    const basicMatchCount = await Match.countDocuments();
    console.log('Total matches in basic database:', basicMatchCount);
    
    // Check detailed matches (live only)
    const detailedMatchCount = await DetailedMatch.countDocuments();
    console.log('Total matches in detailed database:', detailedMatchCount);
    
    if (detailedMatchCount > 0) {
        const liveMatches = await DetailedMatch.find({ status: 'LIVE' })
            .select('basicInfo.matchTitle teams.team1.name teams.team2.name basicInfo.series.name -_id')
            .limit(5);
        
        console.log('\nCurrent live matches with details:');
        liveMatches.forEach(match => {
            console.log(`- ${match.teams.team1.name} vs ${match.teams.team2.name}`);
            console.log(`  Series: ${match.basicInfo.series.name}`);
        });
    }
}

async function testScrapers() {
    try {
        // Connect to database
        await connectToDatabase();

        // Get upcoming matches (basic data only)
        console.log('Fetching upcoming matches...');
        const upcomingMatches = await upcomingMatchScraper.scrapeUpcomingMatches();
        console.log(`Found ${upcomingMatches.length} upcoming matches`);

        // Get live matches and their detailed data
        console.log('\nFetching and processing live matches...');
        const liveMatches = await liveMatchScraper.scrapeLiveMatches();
        console.log(`Found ${liveMatches.length} live matches`);
        
        if (liveMatches.length > 0) {
            console.log('Getting detailed data for live matches...');
            await enhancedMatchScraper.processMatches(
                liveMatches.filter(match => match.status === 'LIVE')
            );
        }

        // Verify database contents
        await verifyDatabaseContents();

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close browser and database connection
        await scraperUtil.close();
        await mongoose.connection.close();
        console.log('Closed all connections');
    }
}

// Run the scraping test
testScrapers();