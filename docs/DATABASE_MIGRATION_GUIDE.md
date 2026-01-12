# Database Migration Guide

## ✅ Migration Files Created

The necessary migration has been created and is ready to apply:
- **File:** `supabase/migrations/20251103000000_add_user_fields.sql`
- **Purpose:** Adds `onboarding_completed` and `metadata` fields to users table

---

## 🚀 Option 1: Apply via Supabase Dashboard (Recommended - EASIEST)

### Steps:

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/aozblceidxpxsovfbmyn/sql/new
   - Or navigate to: Dashboard → SQL Editor → New Query

2. **Copy the SQL:**
   ```sql
   -- Migration: Add missing fields to users table for onboarding
   -- Date: 2025-11-03

   -- Add onboarding_completed field to users table
   ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

   -- Add metadata field for storing additional user/company data
   ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

   -- Add index for onboarding queries
   CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);

   -- Comment for documentation
   COMMENT ON COLUMN users.onboarding_completed IS 'Tracks whether user has completed onboarding flow';
   COMMENT ON COLUMN users.metadata IS 'JSONB field for storing temporary company data during onboarding';
   ```

3. **Click "RUN"** button (or press Cmd/Ctrl + Enter)

4. **Verify Success:**
   - You should see: `Success. No rows returned`
   - This means the columns were added successfully

5. **Test the Migration:**
   Run this query to verify:
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'users'
   AND column_name IN ('onboarding_completed', 'metadata');
   ```

   Expected output:
   ```
   onboarding_completed | boolean | YES
   metadata            | jsonb   | YES
   ```

---

## 🚀 Option 2: Apply via API Endpoint

I've created an admin API endpoint that can run the migration programmatically.

### Steps:

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Check migration status:**
   ```bash
   curl http://localhost:3000/api/admin/migrate
   ```

3. **Apply the migration:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/migrate
   ```

4. **Verify:**
   ```bash
   curl http://localhost:3000/api/admin/migrate
   # Should return: {"migrationApplied":true}
   ```

5. **Important:** Delete the admin endpoint after migration:
   ```bash
   rm app/api/admin/migrate/route.ts
   ```

---

## 🚀 Option 3: Use Migration Checker Script

### Steps:

1. **Run the migration checker:**
   ```bash
   node scripts/run-migration.mjs
   ```

2. **Follow the instructions** provided by the script

3. **Re-run to verify:**
   ```bash
   node scripts/run-migration.mjs
   # Should show: ✅ Migration appears to be applied!
   ```

---

## ✅ Verification Steps

After applying the migration, verify it worked:

### Method 1: Supabase Dashboard
1. Go to Table Editor → users
2. Check that these columns exist:
   - `onboarding_completed` (boolean)
   - `metadata` (jsonb)

### Method 2: SQL Query
```sql
SELECT
  id,
  email,
  onboarding_completed,
  metadata,
  created_at
FROM users
LIMIT 1;
```

### Method 3: Via Script
```bash
node scripts/run-migration.mjs
```

---

## 🐛 Troubleshooting

### Issue: "Permission denied"
**Solution:** Make sure you're using the service role key, not the anon key

### Issue: "Column already exists"
**Solution:** This is fine! The migration uses `IF NOT EXISTS`, so it's safe to run multiple times

### Issue: "Cannot find table 'users'"
**Solution:** Make sure you've run the previous migrations first:
```bash
ls supabase/migrations/
# Should show all migration files in order
```

---

## 📊 What This Migration Does

### Adds Two Columns to `users` Table:

1. **`onboarding_completed` (boolean)**
   - Default: `false`
   - Tracks whether user has completed the onboarding flow
   - Used by auth callback to redirect incomplete users to onboarding

2. **`metadata` (jsonb)**
   - Default: `{}`
   - Stores additional user data like:
     - Onboarding completion timestamp
     - User preferences
     - Temporary company data before company creation

### Adds One Index:
- `idx_users_onboarding_completed` on `onboarding_completed` column
- Speeds up queries that filter by onboarding status

---

## 🔄 Post-Migration Checklist

After successfully applying the migration:

- [ ] Verify columns exist in users table
- [ ] Test user signup flow
- [ ] Test onboarding completion
- [ ] Verify auth callback redirects work
- [ ] Delete admin migration endpoint (if used)
- [ ] Commit migration file to git

---

## 🎯 Next Steps After Migration

1. **Test the complete user flow:**
   ```bash
   # Start your dev server
   npm run dev

   # Open browser and test:
   # 1. Sign up new user
   # 2. Complete onboarding
   # 3. Verify company is created
   # 4. Access dashboard
   ```

2. **Deploy to production:**
   - Push code to git
   - Deploy via Vercel/your platform
   - Run migration on production database
   - Test production flow

3. **Configure Vapi webhooks:**
   - Follow: VAPI_WEBHOOK_SETUP.md
   - Set webhook URL in Vapi dashboard
   - Test with real call

---

## 🆘 Need Help?

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs
2. Verify service role key is correct in `.env.local`
3. Try running migration manually in SQL Editor (Option 1)
4. Contact support with error message

---

## ✨ Migration Status

Run this to check status anytime:
```bash
node scripts/run-migration.mjs
```

**Current Status:** ❌ Not Applied (as of last check)

**Once applied, you'll see:** ✅ Migration appears to be applied!
