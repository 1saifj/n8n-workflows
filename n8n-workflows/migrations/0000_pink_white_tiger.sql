CREATE TABLE `user_preferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`saved_searches` text,
	`bookmarks` text,
	`theme` text DEFAULT 'light',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `workflow_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workflow_id` integer NOT NULL,
	`views` integer DEFAULT 0,
	`downloads` integer DEFAULT 0,
	`last_accessed` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filename` text NOT NULL,
	`name` text NOT NULL,
	`workflow_id` text,
	`active` integer DEFAULT false,
	`description` text,
	`trigger_type` text,
	`complexity` text,
	`node_count` integer DEFAULT 0,
	`integrations` text,
	`tags` text,
	`created_at` text,
	`updated_at` text,
	`file_hash` text,
	`file_size` integer,
	`analyzed_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workflows_filename_unique` ON `workflows` (`filename`);--> statement-breakpoint
CREATE INDEX `idx_trigger_type` ON `workflows` (`trigger_type`);--> statement-breakpoint
CREATE INDEX `idx_complexity` ON `workflows` (`complexity`);--> statement-breakpoint
CREATE INDEX `idx_active` ON `workflows` (`active`);--> statement-breakpoint
CREATE INDEX `idx_node_count` ON `workflows` (`node_count`);--> statement-breakpoint
CREATE INDEX `idx_filename` ON `workflows` (`filename`);--> statement-breakpoint
CREATE TABLE `workflows_fts` (
	`rowid` integer PRIMARY KEY NOT NULL,
	`filename` text,
	`name` text,
	`description` text,
	`integrations` text,
	`tags` text
);
