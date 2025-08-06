
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { extensionsTable, monthlyInstallsTable } from '../db/schema';
import { type BulkCreateMonthlyInstallsInput } from '../schema';
import { createMonthlyInstalls } from '../handlers/create_monthly_installs';
import { eq, and } from 'drizzle-orm';

describe('createMonthlyInstalls', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let extensionId: number;

  beforeEach(async () => {
    // Create a test extension first
    const extensionResult = await db.insert(extensionsTable)
      .values({
        name: 'test-extension',
        description: 'Test extension for monthly installs',
        neon_link: 'https://neon.tech/test-extension'
      })
      .returning()
      .execute();
    
    extensionId = extensionResult[0].id;
  });

  it('should create multiple monthly install records', async () => {
    const input: BulkCreateMonthlyInstallsInput = {
      installs: [
        {
          extension_id: extensionId,
          year: 2024,
          month: 1,
          installs: 100
        },
        {
          extension_id: extensionId,
          year: 2024,
          month: 2,
          installs: 150
        }
      ]
    };

    const result = await createMonthlyInstalls(input);

    expect(result).toHaveLength(2);
    expect(result[0].extension_id).toEqual(extensionId);
    expect(result[0].year).toEqual(2024);
    expect(result[0].month).toEqual(1);
    expect(result[0].installs).toEqual(100);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);

    expect(result[1].extension_id).toEqual(extensionId);
    expect(result[1].year).toEqual(2024);
    expect(result[1].month).toEqual(2);
    expect(result[1].installs).toEqual(150);
  });

  it('should save records to database', async () => {
    const input: BulkCreateMonthlyInstallsInput = {
      installs: [
        {
          extension_id: extensionId,
          year: 2024,
          month: 3,
          installs: 200
        }
      ]
    };

    await createMonthlyInstalls(input);

    const records = await db.select()
      .from(monthlyInstallsTable)
      .where(
        and(
          eq(monthlyInstallsTable.extension_id, extensionId),
          eq(monthlyInstallsTable.year, 2024),
          eq(monthlyInstallsTable.month, 3)
        )
      )
      .execute();

    expect(records).toHaveLength(1);
    expect(records[0].installs).toEqual(200);
    expect(records[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle empty installs array', async () => {
    const input: BulkCreateMonthlyInstallsInput = {
      installs: []
    };

    const result = await createMonthlyInstalls(input);

    expect(result).toHaveLength(0);

    // Verify no records were created
    const allRecords = await db.select()
      .from(monthlyInstallsTable)
      .execute();

    expect(allRecords).toHaveLength(0);
  });

  it('should update existing records on conflict', async () => {
    // First insert
    const initialInput: BulkCreateMonthlyInstallsInput = {
      installs: [
        {
          extension_id: extensionId,
          year: 2024,
          month: 4,
          installs: 300
        }
      ]
    };

    await createMonthlyInstalls(initialInput);

    // Update with new value for same extension/year/month
    const updateInput: BulkCreateMonthlyInstallsInput = {
      installs: [
        {
          extension_id: extensionId,
          year: 2024,
          month: 4,
          installs: 400
        }
      ]
    };

    const result = await createMonthlyInstalls(updateInput);

    expect(result).toHaveLength(1);
    expect(result[0].installs).toEqual(400);

    // Verify only one record exists in database
    const records = await db.select()
      .from(monthlyInstallsTable)
      .where(
        and(
          eq(monthlyInstallsTable.extension_id, extensionId),
          eq(monthlyInstallsTable.year, 2024),
          eq(monthlyInstallsTable.month, 4)
        )
      )
      .execute();

    expect(records).toHaveLength(1);
    expect(records[0].installs).toEqual(400);
  });

  it('should handle multiple extensions in single batch', async () => {
    // Create second extension
    const secondExtensionResult = await db.insert(extensionsTable)
      .values({
        name: 'second-extension',
        description: 'Second test extension',
        neon_link: 'https://neon.tech/second-extension'
      })
      .returning()
      .execute();

    const secondExtensionId = secondExtensionResult[0].id;

    const input: BulkCreateMonthlyInstallsInput = {
      installs: [
        {
          extension_id: extensionId,
          year: 2024,
          month: 5,
          installs: 500
        },
        {
          extension_id: secondExtensionId,
          year: 2024,
          month: 5,
          installs: 600
        }
      ]
    };

    const result = await createMonthlyInstalls(input);

    expect(result).toHaveLength(2);
    
    // Verify both records exist with correct extension IDs
    const firstExtensionRecord = result.find(r => r.extension_id === extensionId);
    const secondExtensionRecord = result.find(r => r.extension_id === secondExtensionId);

    expect(firstExtensionRecord).toBeDefined();
    expect(firstExtensionRecord!.installs).toEqual(500);
    
    expect(secondExtensionRecord).toBeDefined();
    expect(secondExtensionRecord!.installs).toEqual(600);
  });

  it('should handle different years and months', async () => {
    const input: BulkCreateMonthlyInstallsInput = {
      installs: [
        {
          extension_id: extensionId,
          year: 2023,
          month: 12,
          installs: 1000
        },
        {
          extension_id: extensionId,
          year: 2024,
          month: 1,
          installs: 1100
        }
      ]
    };

    const result = await createMonthlyInstalls(input);

    expect(result).toHaveLength(2);

    const dec2023Record = result.find(r => r.year === 2023 && r.month === 12);
    const jan2024Record = result.find(r => r.year === 2024 && r.month === 1);

    expect(dec2023Record).toBeDefined();
    expect(dec2023Record!.installs).toEqual(1000);
    
    expect(jan2024Record).toBeDefined();
    expect(jan2024Record!.installs).toEqual(1100);
  });

  it('should reject invalid foreign key reference', async () => {
    const input: BulkCreateMonthlyInstallsInput = {
      installs: [
        {
          extension_id: 99999, // Non-existent extension
          year: 2024,
          month: 6,
          installs: 700
        }
      ]
    };

    await expect(createMonthlyInstalls(input)).rejects.toThrow(/foreign key constraint/i);
  });
});
