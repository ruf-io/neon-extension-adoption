
import { type BulkCreateMonthlyInstallsInput, type MonthlyInstall } from '../schema';
import { db } from '../db';
import { monthlyInstallsTable } from '../db/schema';
import { sql } from 'drizzle-orm';

export async function createMonthlyInstalls(input: BulkCreateMonthlyInstallsInput): Promise<MonthlyInstall[]> {
  try {
    if (input.installs.length === 0) {
      return [];
    }
    
    const result = await db
      .insert(monthlyInstallsTable)
      .values(input.installs.map(install => ({
        extension_id: install.extension_id,
        year: install.year,
        month: install.month,
        installs: install.installs
      })))
      .onConflictDoUpdate({
        target: [monthlyInstallsTable.extension_id, monthlyInstallsTable.year, monthlyInstallsTable.month],
        set: {
          installs: sql`excluded.installs`
        }
      })
      .returning()
      .execute();
    
    return result;
  } catch (error) {
    console.error('Error creating monthly installs:', error);
    throw error;
  }
}
