/*
  # Clovet Database Schema - Sustainable Secondhand Shopping Platform

  ## Overview
  This migration creates the foundational database structure for Clovet, a sustainable fashion app
  that helps users manage their wardrobe and discover secondhand clothing items.

  ## New Tables

  ### 1. `profiles`
  User profile information extending Supabase auth
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `avatar_url` (text, optional) - Profile picture URL
  - `style_preferences` (jsonb) - Stores user's style preferences and taste profile
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update

  ### 2. `wardrobe_items`
  Catalog of user's clothing items
  - `id` (uuid, primary key) - Unique item identifier
  - `user_id` (uuid, foreign key) - Owner reference
  - `name` (text) - Item name/description
  - `category` (text) - Type (e.g., "blazer", "jeans", "dress")
  - `color` (text) - Primary color
  - `season` (text[]) - Applicable seasons
  - `occasion` (text[]) - Suitable occasions
  - `brand` (text, optional) - Brand name
  - `image_url` (text) - Photo of the item
  - `source_url` (text, optional) - Original listing URL if applicable
  - `purchase_price` (numeric, optional) - What user paid
  - `purchase_date` (date, optional) - When acquired
  - `wear_count` (integer) - Number of times worn
  - `ai_tags` (jsonb) - AI-generated style tags and attributes
  - `created_at` (timestamptz) - When added to wardrobe

  ### 3. `favorite_items`
  Saved items from secondhand platforms
  - `id` (uuid, primary key) - Unique favorite identifier
  - `user_id` (uuid, foreign key) - User who favorited
  - `item_name` (text) - Name of the item
  - `platform` (text) - Source platform (Depop, Poshmark, eBay, etc.)
  - `external_id` (text) - Platform's item ID
  - `image_url` (text) - Item photo
  - `price` (numeric) - Listed price
  - `currency` (text) - Price currency (default: USD)
  - `seller` (text, optional) - Seller information
  - `url` (text) - Direct link to listing
  - `metadata` (jsonb) - Additional item details
  - `created_at` (timestamptz) - When favorited

  ### 4. `outfit_logs`
  Track what users wear for cost-per-wear analysis
  - `id` (uuid, primary key) - Unique log entry
  - `user_id` (uuid, foreign key) - User reference
  - `worn_date` (date) - Date outfit was worn
  - `occasion` (text, optional) - Event/context
  - `items` (jsonb) - Array of wardrobe_item IDs worn together
  - `photo_url` (text, optional) - Optional outfit photo
  - `notes` (text, optional) - User notes
  - `created_at` (timestamptz) - When logged

  ### 5. `style_bundles`
  AI-generated outfit suggestions based on wardrobe
  - `id` (uuid, primary key) - Unique bundle identifier
  - `user_id` (uuid, foreign key) - User reference
  - `name` (text) - Bundle name (e.g., "Coastal Granddaughter Core")
  - `item_ids` (jsonb) - Array of wardrobe_item IDs in bundle
  - `suggested_additions` (jsonb) - Items user could add from secondhand
  - `style_tags` (text[]) - Style descriptors
  - `created_at` (timestamptz) - When generated

  ### 6. `search_history`
  Track searches for personalization
  - `id` (uuid, primary key) - Unique search entry
  - `user_id` (uuid, foreign key) - User reference
  - `query` (text) - Search query text
  - `filters` (jsonb) - Applied filters (size, price, etc.)
  - `results_count` (integer) - Number of results
  - `clicked_items` (jsonb, optional) - Items user clicked on
  - `created_at` (timestamptz) - Search timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Authenticated users required for all operations

  ## Indexes
  - Create indexes on foreign keys for performance
  - Add GIN indexes for JSONB columns for efficient querying
  - Add text search indexes for semantic search capabilities
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  style_preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wardrobe_items table
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  color text,
  season text[],
  occasion text[],
  brand text,
  image_url text NOT NULL,
  source_url text,
  purchase_price numeric(10,2),
  purchase_date date,
  wear_count integer DEFAULT 0,
  ai_tags jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create favorite_items table
CREATE TABLE IF NOT EXISTS favorite_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_name text NOT NULL,
  platform text NOT NULL,
  external_id text NOT NULL,
  image_url text NOT NULL,
  price numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  seller text,
  url text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create outfit_logs table
CREATE TABLE IF NOT EXISTS outfit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  worn_date date NOT NULL,
  occasion text,
  items jsonb NOT NULL,
  photo_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create style_bundles table
CREATE TABLE IF NOT EXISTS style_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  item_ids jsonb NOT NULL,
  suggested_additions jsonb DEFAULT '[]'::jsonb,
  style_tags text[],
  created_at timestamptz DEFAULT now()
);

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  query text NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  results_count integer DEFAULT 0,
  clicked_items jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user_id ON wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_category ON wardrobe_items(category);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_ai_tags ON wardrobe_items USING gin(ai_tags);

CREATE INDEX IF NOT EXISTS idx_favorite_items_user_id ON favorite_items(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_items_platform ON favorite_items(platform);

CREATE INDEX IF NOT EXISTS idx_outfit_logs_user_id ON outfit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_logs_worn_date ON outfit_logs(worn_date);

CREATE INDEX IF NOT EXISTS idx_style_bundles_user_id ON style_bundles(user_id);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for wardrobe_items
CREATE POLICY "Users can view own wardrobe items"
  ON wardrobe_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wardrobe items"
  ON wardrobe_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wardrobe items"
  ON wardrobe_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wardrobe items"
  ON wardrobe_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for favorite_items
CREATE POLICY "Users can view own favorites"
  ON favorite_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorite_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorite_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for outfit_logs
CREATE POLICY "Users can view own outfit logs"
  ON outfit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfit logs"
  ON outfit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outfit logs"
  ON outfit_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfit logs"
  ON outfit_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for style_bundles
CREATE POLICY "Users can view own style bundles"
  ON style_bundles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own style bundles"
  ON style_bundles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own style bundles"
  ON style_bundles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for search_history
CREATE POLICY "Users can view own search history"
  ON search_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history"
  ON search_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);