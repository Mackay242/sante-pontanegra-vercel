-- ───────────────────────────────────────────────────────────
-- Santé Pontanegra — Schema UPDATE for media + consultations
-- Run this in Neon SQL Editor (idempotent, safe to re-run)
-- ───────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════
-- STEP 1: Add mediaUrl + mediaType to ChatMessage
-- ═══════════════════════════════════════════════════════════

ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "mediaUrl" TEXT;
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "mediaType" TEXT;

-- ═══════════════════════════════════════════════════════════
-- STEP 2: Create Consultation table
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "Consultation" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "subject" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Consultation_patientId_doctorId_key" UNIQUE ("patientId", "doctorId")
);

CREATE INDEX IF NOT EXISTS "Consultation_patientId_idx" ON "Consultation"("patientId");
CREATE INDEX IF NOT EXISTS "Consultation_doctorId_idx" ON "Consultation"("doctorId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Consultation_patientId_fkey') THEN
    ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_patientId_fkey"
      FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Consultation_doctorId_fkey') THEN
    ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_doctorId_fkey"
      FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════
-- STEP 3: Create ConsultationMessage table
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "ConsultationMessage" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "isFromDoctor" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ConsultationMessage_consultationId_idx" ON "ConsultationMessage"("consultationId");
CREATE INDEX IF NOT EXISTS "ConsultationMessage_senderId_idx" ON "ConsultationMessage"("senderId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ConsultationMessage_consultationId_fkey') THEN
    ALTER TABLE "ConsultationMessage" ADD CONSTRAINT "ConsultationMessage_consultationId_fkey"
      FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ConsultationMessage_senderId_fkey') THEN
    ALTER TABLE "ConsultationMessage" ADD CONSTRAINT "ConsultationMessage_senderId_fkey"
      FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════
-- DONE! All tables and columns are now ready.
-- ═══════════════════════════════════════════════════════════
