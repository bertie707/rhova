-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "skillLevel" INTEGER NOT NULL,
    "housingHelp" BOOLEAN NOT NULL DEFAULT false,
    "jobHelp" BOOLEAN NOT NULL DEFAULT false,
    "ageRangeMin" INTEGER NOT NULL,
    "ageRangeMax" INTEGER NOT NULL,
    "costTier" TEXT NOT NULL,
    "costDetail" TEXT NOT NULL,
    "carNeeded" BOOLEAN NOT NULL DEFAULT false,
    "carNote" TEXT NOT NULL,
    "socialScene" TEXT NOT NULL,
    "typicalWeek" TEXT NOT NULL,
    "placementLength" TEXT NOT NULL,
    "intakeTiming" TEXT NOT NULL,
    "languageNeeded" TEXT NOT NULL,
    "visaNote" TEXT NOT NULL,
    "nearby" TEXT NOT NULL,
    "safetyNotes" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "destinationGuide" TEXT NOT NULL DEFAULT '',
    "lastContactedAt" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isSampleData" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "otpCode" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "category" TEXT NOT NULL DEFAULT 'rugby',
    "status" TEXT NOT NULL DEFAULT 'not_contacted',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitAttempt" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "firstAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" TIMESTAMP(3),

    CONSTRAINT "RateLimitAttempt_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "Club_category_idx" ON "Club"("category");

-- CreateIndex
CREATE INDEX "Media_clubId_idx" ON "Media"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_email_key" ON "Visitor"("email");

-- CreateIndex
CREATE INDEX "Favorite_clubId_idx" ON "Favorite"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_visitorId_clubId_key" ON "Favorite"("visitorId", "clubId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Review_clubId_idx" ON "Review"("clubId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
