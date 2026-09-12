-- ───────────────────────────────────────────────────────────
-- Santé Pontanegra — Schema UPDATE for new community features
-- Run this in Neon SQL Editor to add new tables and columns
-- Idempotent: safe to run multiple times
-- ───────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════
-- STEP 1: Add new columns to existing tables (idempotent)
-- ═══════════════════════════════════════════════════════════

-- Add columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;

-- Add columns to Post table
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "postType" TEXT NOT NULL DEFAULT 'post';
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "pinned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "solved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "mediaUrl" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "mediaType" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "mediaThumbnail" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "amaStartsAt" TIMESTAMP(3);
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "amaEndsAt" TIMESTAMP(3);
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "amaLive" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Post_postType_idx" ON "Post"("postType");
CREATE INDEX IF NOT EXISTS "Post_pinned_idx" ON "Post"("pinned");

-- Add columns to Comment table
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "isMedicalAnswer" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "pinned" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Comment_authorId_idx" ON "Comment"("authorId");

-- ═══════════════════════════════════════════════════════════
-- STEP 2: Add foreign key from Comment.authorId to User(id)
-- ═══════════════════════════════════════════════════════════

-- First, check if the constraint exists before creating
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Comment_authorId_fkey'
  ) THEN
    ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════
-- STEP 3: Create new tables
-- ═══════════════════════════════════════════════════════════

-- Reactions table (5 reaction types per user per post)
CREATE TABLE IF NOT EXISTS "Reaction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Reaction_postId_userId_key" UNIQUE ("postId", "userId")
);

CREATE INDEX IF NOT EXISTS "Reaction_postId_idx" ON "Reaction"("postId");
CREATE INDEX IF NOT EXISTS "Reaction_userId_idx" ON "Reaction"("userId");

-- Foreign keys for Reaction
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Reaction_postId_fkey') THEN
    ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_postId_fkey"
      FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Reaction_userId_fkey') THEN
    ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Follow table (user follows another user)
CREATE TABLE IF NOT EXISTS "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Follow_followerId_followingId_key" UNIQUE ("followerId", "followingId")
);

CREATE INDEX IF NOT EXISTS "Follow_followerId_idx" ON "Follow"("followerId");
CREATE INDEX IF NOT EXISTS "Follow_followingId_idx" ON "Follow"("followingId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Follow_followerId_fkey') THEN
    ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey"
      FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Follow_followingId_fkey') THEN
    ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey"
      FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AMA table (Ask Me Anything sessions)
CREATE TABLE IF NOT EXISTS "AMA" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AMA_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AMA_hostId_idx" ON "AMA"("hostId");
CREATE INDEX IF NOT EXISTS "AMA_startsAt_idx" ON "AMA"("startsAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AMA_hostId_fkey') THEN
    ALTER TABLE "AMA" ADD CONSTRAINT "AMA_hostId_fkey"
      FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AMAQuestion table (questions asked during an AMA)
CREATE TABLE IF NOT EXISTS "AMAQuestion" (
    "id" TEXT NOT NULL,
    "amaId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "answered" BOOLEAN NOT NULL DEFAULT false,
    "answer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AMAQuestion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AMAQuestion_amaId_idx" ON "AMAQuestion"("amaId");
CREATE INDEX IF NOT EXISTS "AMAQuestion_authorId_idx" ON "AMAQuestion"("authorId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AMAQuestion_amaId_fkey') THEN
    ALTER TABLE "AMAQuestion" ADD CONSTRAINT "AMAQuestion_amaId_fkey"
      FOREIGN KEY ("amaId") REFERENCES "AMA"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AMAQuestion_authorId_fkey') THEN
    ALTER TABLE "AMAQuestion" ADD CONSTRAINT "AMAQuestion_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════
-- DONE! All tables and columns are now ready.
-- ═══════════════════════════════════════════════════════════
