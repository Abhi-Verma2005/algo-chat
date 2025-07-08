CREATE TABLE IF NOT EXISTS "Chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"messages" json NOT NULL,
	"external_user_id" varchar(255) NOT NULL,
	"user_email" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CodeSubmissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_user_id" varchar(255) NOT NULL,
	"question_slug" varchar(255) NOT NULL,
	"code" text NOT NULL,
	"language" varchar(50) DEFAULT 'python' NOT NULL,
	"problem_title" varchar(500),
	"submission_status" varchar(50) DEFAULT 'accepted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_question_idx" ON "CodeSubmissions" USING btree ("external_user_id","question_slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_idx" ON "CodeSubmissions" USING btree ("external_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_idx" ON "CodeSubmissions" USING btree ("question_slug");