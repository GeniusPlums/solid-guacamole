import { pgTable, uuid, text, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['brand', 'influencer']);
export const campaignStatusEnum = pgEnum('campaign_status', ['draft', 'active', 'paused', 'completed', 'cancelled']);
export const collaborationStatusEnum = pgEnum('collaboration_status', ['pending', 'accepted', 'rejected', 'completed', 'cancelled']);

// Users table (for authentication)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  avatarUrl: text('avatar_url'),
  userType: userRoleEnum('user_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Brand Profiles
export const brandProfiles = pgTable('brand_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }).unique(),
  companyName: text('company_name').notNull(),
  description: text('description'),
  industry: text('industry'),
  website: text('website'),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Influencer Profiles
export const influencerProfiles = pgTable('influencer_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }).unique(),
  bio: text('bio'),
  location: text('location'),
  niche: text('niche').array(),
  languages: text('languages').array(),
  instagramHandle: text('instagram_handle'),
  instagramFollowers: integer('instagram_followers'),
  youtubeHandle: text('youtube_handle'),
  youtubeSubscribers: integer('youtube_subscribers'),
  twitterHandle: text('twitter_handle'),
  twitterFollowers: integer('twitter_followers'),
  tiktokHandle: text('tiktok_handle'),
  tiktokFollowers: integer('tiktok_followers'),
  engagementRate: numeric('engagement_rate', { precision: 5, scale: 2 }),
  rating: numeric('rating', { precision: 3, scale: 2 }),
  totalCollaborations: integer('total_collaborations').default(0),
  portfolioImages: text('portfolio_images').array(),
  contentSamples: text('content_samples').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Campaigns
export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  brandId: uuid('brand_id').notNull().references(() => brandProfiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  budget: numeric('budget', { precision: 12, scale: 2 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  status: campaignStatusEnum('status').default('draft'),
  targetPlatforms: text('target_platforms').array(),
  targetNiche: text('target_niche').array(),
  minFollowers: integer('min_followers'),
  maxFollowers: integer('max_followers'),
  targetEngagementRate: numeric('target_engagement_rate', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Collaborations
export const collaborations = pgTable('collaborations', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  influencerId: uuid('influencer_id').notNull().references(() => influencerProfiles.id, { onDelete: 'cascade' }),
  brandId: uuid('brand_id').notNull().references(() => brandProfiles.id, { onDelete: 'cascade' }),
  status: collaborationStatusEnum('status').default('pending'),
  offeredAmount: numeric('offered_amount', { precision: 12, scale: 2 }),
  deliverables: text('deliverables'),
  deadline: timestamp('deadline'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  fromUserId: uuid('from_user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  toUserId: uuid('to_user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  collaborationId: uuid('collaboration_id').references(() => collaborations.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Ratings
export const ratings = pgTable('ratings', {
  id: uuid('id').defaultRandom().primaryKey(),
  collaborationId: uuid('collaboration_id').notNull().references(() => collaborations.id, { onDelete: 'cascade' }),
  fromUserId: uuid('from_user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  toUserId: uuid('to_user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  review: text('review'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.id] }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.id], references: [users.id] }),
  brandProfile: one(brandProfiles, { fields: [profiles.id], references: [brandProfiles.userId] }),
  influencerProfile: one(influencerProfiles, { fields: [profiles.id], references: [influencerProfiles.userId] }),
}));

export const brandProfilesRelations = relations(brandProfiles, ({ one, many }) => ({
  profile: one(profiles, { fields: [brandProfiles.userId], references: [profiles.id] }),
  campaigns: many(campaigns),
  collaborations: many(collaborations),
}));

export const influencerProfilesRelations = relations(influencerProfiles, ({ one, many }) => ({
  profile: one(profiles, { fields: [influencerProfiles.userId], references: [profiles.id] }),
  collaborations: many(collaborations),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  brand: one(brandProfiles, { fields: [campaigns.brandId], references: [brandProfiles.id] }),
  collaborations: many(collaborations),
}));

export const collaborationsRelations = relations(collaborations, ({ one }) => ({
  campaign: one(campaigns, { fields: [collaborations.campaignId], references: [campaigns.id] }),
  influencer: one(influencerProfiles, { fields: [collaborations.influencerId], references: [influencerProfiles.id] }),
  brand: one(brandProfiles, { fields: [collaborations.brandId], references: [brandProfiles.id] }),
}));

