// scripts/test-scraping.js
require('dotenv').config();
const mongoose = require('mongoose');
const upcomingMatchScraper = require('../src/services/scrapers/upcomingMatchScraper');
const liveMatchScraper = require('../src/services/scrapers/liveMatchScraper');
const scraperUtil = require('../src/utils/scraper');
const Match = require('../src/models/Match');

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
    const matchCount = await Match.countDocuments();
    console.log('Total matches in database:', matchCount);
    
    if (matchCount > 0) {
        // Group matches by status
        const matchStatuses = await Match.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    matches: { 
                        $push: { 
                            teams: { 
                                $concat: ['$team1', ' vs ', '$team2'] 
                            },
                            seriesName: '$seriesName'
                        } 
                    }
                }
            }
        ]);

        console.log('\nMatches by status:');
        matchStatuses.forEach(status => {
            console.log(`\n${status._id} (${status.count} matches):`);
            status.matches.slice(0, 2).forEach(match => {
                console.log(`- ${match.teams} (${match.seriesName})`);
            });
            if (status.matches.length > 2) {
                console.log(`  ... and ${status.matches.length - 2} more`);
            }
        });

        // Check for unknown types
        const unknownTypeCount = await Match.countDocuments({ matchType: 'OTHER' });
        if (unknownTypeCount > 0) {
            console.log('\nUnknown match types:', unknownTypeCount);
            const unknownMatches = await Match.find({ matchType: 'OTHER' })
                .select('seriesName team1 team2 -_id')
                .limit(5);
            console.log('Sample unknown matches:');
            unknownMatches.forEach(match => {
                console.log(`- ${match.team1} vs ${match.team2} (${match.seriesName})`);
            });
        }
    }
}

async function testScrapers() {
    try {
        // Connect to database
        await connectToDatabase();

        // Optional: Clear existing matches before scraping
        // Uncomment the next line to clear the database before scraping
        // await Match.deleteMany({});

        console.log('Testing upcoming matches scraper...');
        const upcomingMatches = await upcomingMatchScraper.scrapeUpcomingMatches();
        console.log(`Found ${upcomingMatches.length} upcoming matches`);
        if (upcomingMatches.length > 0) {
            console.log('Sample scraped upcoming match:', JSON.stringify(upcomingMatches[0], null, 2));
        }

        console.log('\nTesting live matches scraper...');
        const liveMatches = await liveMatchScraper.scrapeLiveMatches();
        console.log(`Found ${liveMatches.length} live matches`);
        if (liveMatches.length > 0) {
            console.log('Sample scraped live match:', JSON.stringify(liveMatches[0], null, 2));
        }

        // Verify database contents after scraping
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

testScrapers();