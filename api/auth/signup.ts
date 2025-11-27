import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { db, schema } from '../_lib/db';
import { createToken } from '../_lib/auth';
import { setCorsHeaders } from '../_lib/cors';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, fullName, userType } = req.body;

    if (!email || !password || !fullName || !userType) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existing = await db.query.profiles.findFirst({
      where: eq(schema.profiles.email, email),
    });

    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create profile
    const [profile] = await db
      .insert(schema.profiles)
      .values({
        email,
        passwordHash,
        fullName,
        userType,
      })
      .returning();

    // Create type-specific profile
    if (userType === 'brand') {
      await db.insert(schema.brandProfiles).values({ userId: profile.id });
    } else {
      await db.insert(schema.influencerProfiles).values({ userId: profile.id });
    }

    const token = createToken({ userId: profile.id, email: profile.email });

    res.status(201).json({
      success: true,
      session: {
        user: { id: profile.id, email: profile.email },
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
}

