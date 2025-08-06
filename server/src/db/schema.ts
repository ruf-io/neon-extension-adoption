
import { serial, text, pgTable, timestamp, integer, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const extensionsTable = pgTable('extensions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  neon_link: text('neon_link').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('extensions_name_idx').on(table.name),
}));

export const monthlyInstallsTable = pgTable('monthly_installs', {
  id: serial('id').primaryKey(),
  extension_id: integer('extension_id').references(() => extensionsTable.id).notNull(),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  installs: integer('installs').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  extensionYearMonthIdx: index('monthly_installs_extension_year_month_idx').on(table.extension_id, table.year, table.month),
  uniqueExtensionYearMonth: unique('unique_extension_year_month').on(table.extension_id, table.year, table.month),
}));

// Relations
export const extensionsRelations = relations(extensionsTable, ({ many }) => ({
  monthlyInstalls: many(monthlyInstallsTable),
}));

export const monthlyInstallsRelations = relations(monthlyInstallsTable, ({ one }) => ({
  extension: one(extensionsTable, {
    fields: [monthlyInstallsTable.extension_id],
    references: [extensionsTable.id],
  }),
}));

// TypeScript types
export type Extension = typeof extensionsTable.$inferSelect;
export type NewExtension = typeof extensionsTable.$inferInsert;
export type MonthlyInstall = typeof monthlyInstallsTable.$inferSelect;
export type NewMonthlyInstall = typeof monthlyInstallsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  extensions: extensionsTable, 
  monthlyInstalls: monthlyInstallsTable 
};

export const tableRelations = {
  extensionsRelations,
  monthlyInstallsRelations
};
