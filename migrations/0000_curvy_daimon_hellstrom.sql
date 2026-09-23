CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`initial` text DEFAULT '' NOT NULL,
	`status` text NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	`featured` integer DEFAULT 0 NOT NULL,
	`pinned` integer DEFAULT 0 NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	`data` text NOT NULL,
	`search` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `records_visibility` ON `records` (`deleted`,`status`,`kind`);--> statement-breakpoint
CREATE INDEX `records_initial` ON `records` (`initial`);--> statement-breakpoint
CREATE INDEX `records_created` ON `records` (`created`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
