import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, profiles, influencerProfiles, brandProfiles } from '../src/db/schema';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const sampleInfluencers = [
  {
    email: 'emma.style@example.com',
    fullName: 'Emma Rodriguez',
    bio: 'Fashion & lifestyle content creator passionate about sustainable fashion and body positivity.',
    location: 'Los Angeles, CA',
    niche: ['Fashion', 'Lifestyle', 'Sustainability'],
    languages: ['English', 'Spanish'],
    instagramHandle: '@emmarstyle',
    instagramFollowers: 520000,
    youtubeSubscribers: 180000,
    twitterFollowers: 45000,
    tiktokFollowers: 890000,
    engagementRate: '4.8',
    rating: '4.7',
  },
  {
    email: 'techsam@example.com',
    fullName: 'Sam Chen',
    bio: 'Tech reviewer and gadget enthusiast. Making technology accessible for everyone.',
    location: 'San Francisco, CA',
    niche: ['Technology', 'Gaming', 'Reviews'],
    languages: ['English', 'Mandarin'],
    instagramHandle: '@techsam',
    instagramFollowers: 340000,
    youtubeSubscribers: 920000,
    twitterFollowers: 120000,
    tiktokFollowers: 450000,
    engagementRate: '5.2',
    rating: '4.9',
  },
  {
    email: 'fitnessjake@example.com',
    fullName: 'Jake Thompson',
    bio: 'Certified personal trainer and nutrition coach. Helping you achieve your fitness goals!',
    location: 'Miami, FL',
    niche: ['Fitness', 'Health', 'Nutrition'],
    languages: ['English'],
    instagramHandle: '@fitjake',
    instagramFollowers: 780000,
    youtubeSubscribers: 320000,
    twitterFollowers: 89000,
    tiktokFollowers: 1200000,
    engagementRate: '6.1',
    rating: '4.8',
  },
  {
    email: 'foodiemaya@example.com',
    fullName: 'Maya Patel',
    bio: 'Food blogger and recipe developer. Exploring cuisines from around the world!',
    location: 'New York, NY',
    niche: ['Food', 'Cooking', 'Travel'],
    languages: ['English', 'Hindi'],
    instagramHandle: '@mayaeats',
    instagramFollowers: 420000,
    youtubeSubscribers: 280000,
    twitterFollowers: 56000,
    tiktokFollowers: 680000,
    engagementRate: '5.5',
    rating: '4.6',
  },
  {
    email: 'beautylisa@example.com',
    fullName: 'Lisa Kim',
    bio: 'Beauty and skincare expert. Honest reviews and tutorials for all skin types.',
    location: 'Seattle, WA',
    niche: ['Beauty', 'Skincare', 'Makeup'],
    languages: ['English', 'Korean'],
    instagramHandle: '@lisabeauty',
    instagramFollowers: 650000,
    youtubeSubscribers: 450000,
    twitterFollowers: 78000,
    tiktokFollowers: 920000,
    engagementRate: '4.9',
    rating: '4.8',
  },
  {
    email: 'travelalex@example.com',
    fullName: 'Alex Morgan',
    bio: 'Adventure traveler and photographer. Capturing the worlds most beautiful destinations.',
    location: 'Denver, CO',
    niche: ['Travel', 'Photography', 'Adventure'],
    languages: ['English', 'French'],
    instagramHandle: '@wanderalex',
    instagramFollowers: 890000,
    youtubeSubscribers: 520000,
    twitterFollowers: 134000,
    tiktokFollowers: 760000,
    engagementRate: '5.8',
    rating: '4.9',
  },
];

async function seed() {
  console.log('🌱 Starting database seed...');
  const passwordHash = await bcrypt.hash('password123', 10);

  for (const influencer of sampleInfluencers) {
    try {
      // Create user
      const [user] = await db.insert(users).values({
        email: influencer.email,
        passwordHash,
      }).returning();

      // Create profile
      await db.insert(profiles).values({
        id: user.id,
        email: influencer.email,
        fullName: influencer.fullName,
        userType: 'influencer',
      });

      // Create influencer profile
      await db.insert(influencerProfiles).values({
        userId: user.id,
        bio: influencer.bio,
        location: influencer.location,
        niche: influencer.niche,
        languages: influencer.languages,
        instagramHandle: influencer.instagramHandle,
        instagramFollowers: influencer.instagramFollowers,
        youtubeSubscribers: influencer.youtubeSubscribers,
        twitterFollowers: influencer.twitterFollowers,
        tiktokFollowers: influencer.tiktokFollowers,
        engagementRate: influencer.engagementRate,
        rating: influencer.rating,
      });

      console.log(`✅ Created influencer: ${influencer.fullName}`);
    } catch (error) {
      console.error(`❌ Error creating ${influencer.fullName}:`, error);
    }
  }

  console.log('🎉 Seed completed!');
  process.exit(0);
}

seed().catch(console.error);

