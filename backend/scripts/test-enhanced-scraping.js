// scripts/test-enhanced-scraping.js
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

async function verifyDetailedDatabaseContents() {
    console.log('\nVerifying detailed match database contents...');
    const detailedMatchCount = await DetailedMatch.countDocuments();
    console.log('Total detailed matches in database:', detailedMatchCount);
    
    if (detailedMatchCount > 0) {
        // Group matches by status
        const matchStatuses = await DetailedMatch.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    matches: { 
                        $push: { 
                            matchTitle: '$basicInfo.matchTitle',
                            series: '$basicInfo.series.name',
                            venue: '$basicInfo.venue.name'
                        } 
                    }
                }
            }
        ]);

        console.log('\nDetailed matches by status:');
        matchStatuses.forEach(status => {
            console.log(`\n${status._id} (${status.count} matches):`);
            status.matches.slice(0, 2).forEach(match => {
                console.log(`- ${match.matchTitle}`);
                console.log(`  Series: ${match.series}`);
                console.log(`  Venue: ${match.venue}`);
            });
            if (status.matches.length > 2) {
                console.log(`  ... and ${status.matches.length - 2} more`);
            }
        });

        // Sample innings data
        const matchWithInnings = await DetailedMatch.findOne({ 
            innings: { $exists: true, $not: { $size: 0 } } 
        });
        if (matchWithInnings) {
            console.log('\nSample innings data:');
            console.log(JSON.stringify(matchWithInnings.innings[0], null, 2));
        }
    }
}

async function testEnhancedScrapers() {
    try {
        // Connect to database
        await connectToDatabase();

        // First get basic match data
        console.log('Fetching upcoming matches...');
        const upcomingMatches = await upcomingMatchScraper.scrapeUpcomingMatches();
        console.log(`Found ${upcomingMatches.length} upcoming matches`);

        console.log('\nFetching live matches...');
        const liveMatches = await liveMatchScraper.scrapeLiveMatches();
        console.log(`Found ${liveMatches.length} live matches`);

        // Then process all matches for detailed data
        const allMatches = [...upcomingMatches, ...liveMatches];
        console.log(`\nProcessing ${allMatches.length} total matches for detailed information...`);
        
        await enhancedMatchScraper.processMatches(allMatches);

        // Verify database contents
        await verifyDetailedDatabaseContents();

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close browser and database connection
        await scraperUtil.close();
        await mongoose.connection.close();
        console.log('Closed all connections');
    }
}

// Run the enhanced scraping test
testEnhancedScrapers();