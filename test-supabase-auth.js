/**
 * Standalone Supabase Authentication Test Script
 * 
 * This script tests:
 * 1. Supabase client initialization
 * 2. User sign-up functionality
 * 3. User sign-in functionality
 * 4. Getting the current session
 * 
 * Usage:
 *   Node.js: node test-supabase-auth.js
 *   Browser: Copy and paste into browser console (after updating import)
 * 
 * IMPORTANT: You need to get your anon key from the Supabase dashboard:
 * 1. Go to https://supabase.com/dashboard/project/dgvbnbzspmtzrflxwqlv/settings/api
 * 2. Copy the "anon public" key
 * 3. Replace YOUR_ANON_KEY_HERE below with that key
 */

// ============ CONFIGURATION ============
// Update these values with your Supabase credentials
const SUPABASE_URL = "https://dgvbnbzspmtzrflxwqlv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9dNtJyiRD0K7sBRhRC2h7A_WEVo1_CZ";

// Test user credentials (use a real email format)
const TEST_EMAIL = "testuser" + Math.floor(Math.random() * 10000) + "@gmail.com";
const TEST_PASSWORD = "TestPassword123!";
const TEST_NAME = "Test User";

// ============ SUPABASE CLIENT SETUP ============
// For Node.js usage, uncomment the following line:
// const { createClient } = require('@supabase/supabase-js');

// For ES modules or browser, use:
// import { createClient } from '@supabase/supabase-js';

// Browser-compatible fetch of Supabase (inline for testing)
async function testSupabaseConnection() {
  console.log("=".repeat(60));
  console.log("🧪 SUPABASE AUTHENTICATION TEST SCRIPT");
  console.log("=".repeat(60));
  console.log("");

  // Check configuration
  console.log("📋 Configuration Check:");
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log(`   Anon Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  console.log("");

  if (SUPABASE_ANON_KEY === "YOUR_ANON_KEY_HERE") {
    console.log("❌ ERROR: You need to set the SUPABASE_ANON_KEY!");
    console.log("");
    console.log("📝 How to get your anon key:");
    console.log("   1. Go to: https://supabase.com/dashboard/project/dgvbnbzspmtzrflxwqlv/settings/api");
    console.log("   2. Under 'Project API keys', copy the 'anon public' key");
    console.log("   3. Replace YOUR_ANON_KEY_HERE in this script with that key");
    console.log("");
    return;
  }

  // Test 1: Initialize Supabase Client
  console.log("🔧 Test 1: Initializing Supabase Client...");
  let supabase;
  try {
    // Dynamic import for Node.js ES modules
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("   ✅ Supabase client initialized successfully!");
  } catch (error) {
    console.log("   ❌ Failed to initialize Supabase client:");
    console.log(`      Error: ${error.message}`);
    console.log("");
    console.log("   💡 If running in Node.js, make sure @supabase/supabase-js is installed:");
    console.log("      npm install @supabase/supabase-js");
    return;
  }
  console.log("");

  // Test 2: Check connection by fetching health
  console.log("🌐 Test 2: Testing API Connection...");
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.log(`   ⚠️ API Response: ${error.message}`);
      console.log("   (This may be normal if RLS policies are enabled)");
    } else {
      console.log("   ✅ API connection successful!");
    }
  } catch (error) {
    console.log(`   ❌ API connection failed: ${error.message}`);
  }
  console.log("");

  // Test 3: Sign Up
  console.log("📝 Test 3: Testing Sign Up...");
  console.log(`   Email: ${TEST_EMAIL}`);
  console.log(`   Password: ${TEST_PASSWORD}`);
  try {
    const { data, error } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        data: {
          name: TEST_NAME,
          user_type: "brand"
        }
      }
    });

    if (error) {
      console.log(`   ❌ Sign Up failed: ${error.message}`);
      console.log(`   Error code: ${error.status || 'N/A'}`);
      console.log(`   Full error: ${JSON.stringify(error, null, 2)}`);

      if (error.message.includes("Database error")) {
        console.log("");
        console.log("   💡 FIX: Run the SQL in supabase/fix-trigger.sql in your Supabase SQL Editor:");
        console.log("      https://supabase.com/dashboard/project/dgvbnbzspmtzrflxwqlv/sql/new");
      }
    } else if (data.user) {
      console.log("   ✅ Sign Up successful!");
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Confirmed: ${data.user.confirmed_at ? 'Yes' : 'No (check email)'}`);
    } else {
      console.log("   ⚠️ Sign Up returned no user - email confirmation may be required");
    }
  } catch (error) {
    console.log(`   ❌ Sign Up exception: ${error.message}`);
  }
  console.log("");

  // Test 4: Sign In
  console.log("🔐 Test 4: Testing Sign In...");
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (error) {
      console.log(`   ❌ Sign In failed: ${error.message}`);
      if (error.message.includes("Email not confirmed")) {
        console.log("   💡 This means signup worked but email confirmation is required.");
        console.log("      Check your Supabase Auth settings to disable email confirmation for testing.");
      }
    } else if (data.session) {
      console.log("   ✅ Sign In successful!");
      console.log(`   Access Token: ${data.session.access_token.substring(0, 30)}...`);
      console.log(`   User ID: ${data.user.id}`);
    } else {
      console.log("   ⚠️ Sign In returned no session");
    }
  } catch (error) {
    console.log(`   ❌ Sign In exception: ${error.message}`);
  }
  console.log("");

  // Test 5: Get Session
  console.log("📊 Test 5: Getting Current Session...");
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log(`   ❌ Get Session failed: ${error.message}`);
    } else if (session) {
      console.log("   ✅ Session retrieved successfully!");
      console.log(`   User: ${session.user.email}`);
      console.log(`   Expires: ${new Date(session.expires_at * 1000).toLocaleString()}`);
    } else {
      console.log("   ⚠️ No active session");
    }
  } catch (error) {
    console.log(`   ❌ Get Session exception: ${error.message}`);
  }
  console.log("");

  // Summary
  console.log("=".repeat(60));
  console.log("📋 SUMMARY & RECOMMENDATIONS");
  console.log("=".repeat(60));
  console.log("");
  console.log("If tests failed, check the following:");
  console.log("");
  console.log("1. ✓ Verify your Supabase URL matches your project");
  console.log("2. ✓ Make sure you're using the correct 'anon public' key");
  console.log("3. ✓ Check if email confirmation is disabled in Supabase Auth settings");
  console.log("4. ✓ Ensure RLS policies allow the operations");
  console.log("5. ✓ Check if the profiles table exists and has proper triggers");
  console.log("");
  console.log("Supabase Dashboard Links:");
  console.log(`   Auth Settings: https://supabase.com/dashboard/project/dgvbnbzspmtzrflxwqlv/auth/providers`);
  console.log(`   API Keys: https://supabase.com/dashboard/project/dgvbnbzspmtzrflxwqlv/settings/api`);
  console.log(`   Table Editor: https://supabase.com/dashboard/project/dgvbnbzspmtzrflxwqlv/editor`);
}

// Run the tests
testSupabaseConnection().catch(console.error);

