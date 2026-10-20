CREATE TABLE "ballot_picks" (
	"id" serial PRIMARY KEY NOT NULL,
	"ballot_id" integer NOT NULL,
	"nominee_id" integer NOT NULL,
	"rank" integer
);
--> statement-breakpoint
CREATE TABLE "ballots" (
	"id" serial PRIMARY KEY NOT NULL,
	"voter_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"tagline" text,
	"kind" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"auto_nominees" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"photo_url" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nominees" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"member_id" integer,
	"author_name" text,
	"message_text" text,
	"message_at" text,
	"rank_position" integer,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"group_code" text NOT NULL,
	"voting_open" boolean DEFAULT false NOT NULL,
	"reveal_active" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ballot_picks" ADD CONSTRAINT "ballot_picks_ballot_id_ballots_id_fk" FOREIGN KEY ("ballot_id") REFERENCES "public"."ballots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ballot_picks" ADD CONSTRAINT "ballot_picks_nominee_id_nominees_id_fk" FOREIGN KEY ("nominee_id") REFERENCES "public"."nominees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ballots" ADD CONSTRAINT "ballots_voter_id_members_id_fk" FOREIGN KEY ("voter_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ballots" ADD CONSTRAINT "ballots_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nominees" ADD CONSTRAINT "nominees_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nominees" ADD CONSTRAINT "nominees_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ballot_picks_ballot_nominee_key" ON "ballot_picks" USING btree ("ballot_id","nominee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ballots_voter_category_key" ON "ballots" USING btree ("voter_id","category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_key_key" ON "categories" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "members_name_key" ON "members" USING btree ("name");