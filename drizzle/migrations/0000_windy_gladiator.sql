CREATE TABLE `essays` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question` text NOT NULL,
	`answer` text(2500) NOT NULL,
	`aiResponse` text,
	`dateSubmitted` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);