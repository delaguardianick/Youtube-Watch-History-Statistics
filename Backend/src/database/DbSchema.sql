CREATE TABLE "Takeouts" (
  "takeout_id" varchar PRIMARY KEY,
  "user_id" integer,
  "upload_date" timestamp
);

CREATE TABLE "Videos" (
  "video_id" varchar PRIMARY KEY,
  "title" varchar,
  "duration" integer,
  "upload_date_iso" timestamp,
  "video_URL" TEXT,
  "channel_name" TEXT,
  "channel_url" TEXT,
  "video_status" TEXT,
  "video_length_secs" TEXT,
  "video_description" TEXT,
  "category_id" INTEGER,
  "tags" TEXT,
  "transcript" TEXT
);

CREATE TABLE "TakeoutVideos" (
  "takeout_video_id" integer PRIMARY KEY,
  "takeout_id" varchar,
  "video_id" varchar,
  "watch_date" timestamp
);

ALTER TABLE "TakeoutVideos" ADD FOREIGN KEY ("takeout_id") REFERENCES "Takeouts" ("takeout_id");

ALTER TABLE "TakeoutVideos" ADD FOREIGN KEY ("video_id") REFERENCES "Videos" ("video_id");
