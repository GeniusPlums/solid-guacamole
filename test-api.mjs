// Simple API tests for Neon + JWT Auth migration
const API_URL = 'http://localhost:3001/api';
let authToken = null;
let userId = null;
let brandProfileId = null;
let campaignId = null;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

async function api(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Generate unique email for testing
const testEmail = `test_${Date.now()}@example.com`;
const testPassword = 'TestPass123!';

async function runTests() {
  console.log('\n🧪 Starting API Tests...\n');
  console.log('--- 1. AUTH TESTS ---');
  
  // Test Sign Up
  await test('Sign up new brand user', async () => {
    const data = await api('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'Test Brand',
        userType: 'brand'
      })
    });
    if (!data.session?.token) throw new Error('No token returned');
    authToken = data.session.token;
    userId = data.session.user.id;
  });

  // Test Sign In
  await test('Sign in with credentials', async () => {
    const data = await api('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    if (!data.session?.token) throw new Error('No token returned');
    authToken = data.session.token;
  });

  // Test Get Session
  await test('Get current session', async () => {
    const data = await api('/auth/session');
    if (!data.user?.id) throw new Error('No user in session');
  });

  console.log('\n--- 2. PROFILE TESTS ---');
  
  // Create Brand Profile
  await test('Create brand profile', async () => {
    const data = await api('/profiles/brand', {
      method: 'POST',
      body: JSON.stringify({
        companyName: 'Test Company',
        description: 'A test company',
        industry: 'Technology'
      })
    });
    if (!data.id) throw new Error('No profile ID returned');
    brandProfileId = data.id;
  });

  // Get Profile
  await test('Get my profile', async () => {
    const data = await api('/profiles/me');
    if (!data.profile) throw new Error('No profile returned');
    if (!data.brandProfile) throw new Error('No brand profile returned');
  });

  console.log('\n--- 3. CAMPAIGN TESTS ---');

  // Create Campaign
  await test('Create campaign', async () => {
    const data = await api('/campaigns', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Campaign',
        description: 'A test marketing campaign',
        budget: 5000,
        status: 'draft',
        targetNiche: ['tech', 'lifestyle']
      })
    });
    if (!data.id) throw new Error('No campaign ID returned');
    campaignId = data.id;
  });

  // Get Campaigns
  await test('Get all campaigns', async () => {
    const data = await api('/campaigns');
    if (!Array.isArray(data)) throw new Error('Expected array');
    if (data.length === 0) throw new Error('No campaigns found');
  });

  // Get Single Campaign
  await test('Get single campaign', async () => {
    const data = await api(`/campaigns/${campaignId}`);
    if (data.title !== 'Test Campaign') throw new Error('Wrong campaign');
  });

  // Update Campaign
  await test('Update campaign', async () => {
    const data = await api(`/campaigns/${campaignId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active' })
    });
    if (data.status !== 'active') throw new Error('Status not updated');
  });

  console.log('\n--- 4. INFLUENCER/MARKETPLACE TESTS ---');

  // Get Influencers (public)
  await test('Get influencers list', async () => {
    const data = await api('/influencers');
    if (!Array.isArray(data)) throw new Error('Expected array');
    console.log(`   Found ${data.length} influencers`);
  });

  // Sign Out
  await test('Sign out', async () => {
    await api('/auth/signout', { method: 'POST' });
    authToken = null;
  });

  console.log('\n✨ All tests completed!\n');
}

runTests().catch(console.error);

