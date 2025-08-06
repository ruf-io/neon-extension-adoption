
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { extensionsTable, monthlyInstallsTable } from '../db/schema';
import { getExtensions } from '../handlers/get_extensions';

describe('getExtensions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no extensions exist', async () => {
    const result = await getExtensions();
    expect(result).toEqual([]);
  });

  it('should return extension without install data', async () => {
    // Create extension without monthly install data
    await db.insert(extensionsTable).values({
      name: 'Test Extension',
      description: 'Test Description',
      neon_link: 'https://example.com'
    }).execute();

    const result = await getExtensions();
    
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'Test Extension',
      description: 'Test Description',
      neon_link: 'https://example.com',
      monthly_installs: [],
      last_month_installs: 0,
      total_installs: 0
    });
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return extension with monthly install data', async () => {
    // Create extension
    const extensionResult = await db.insert(extensionsTable).values({
      name: 'Extension with Installs',
      description: 'Has install data',
      neon_link: 'https://example.com'
    }).returning().execute();
    
    const extensionId = extensionResult[0].id;

    // Create monthly install data
    await db.insert(monthlyInstallsTable).values([
      {
        extension_id: extensionId,
        year: 2023,
        month: 1,
        installs: 100
      },
      {
        extension_id: extensionId,
        year: 2023,
        month: 2,
        installs: 150
      },
      {
        extension_id: extensionId,
        year: 2023,
        month: 3,
        installs: 200
      }
    ]).execute();

    const result = await getExtensions();
    
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'Extension with Installs',
      description: 'Has install data',
      neon_link: 'https://example.com',
      total_installs: 450, // 100 + 150 + 200
      last_month_installs: 200 // Most recent month (March)
    });
    
    expect(result[0].monthly_installs).toEqual([
      { year: 2023, month: 1, installs: 100 },
      { year: 2023, month: 2, installs: 150 },
      { year: 2023, month: 3, installs: 200 }
    ]);
  });

  it('should return multiple extensions ordered by name', async () => {
    // Create extensions in reverse alphabetical order
    const extensions = [
      { name: 'Zebra Extension', description: 'Last', neon_link: 'https://zebra.com' },
      { name: 'Alpha Extension', description: 'First', neon_link: 'https://alpha.com' },
      { name: 'Beta Extension', description: 'Second', neon_link: 'https://beta.com' }
    ];

    for (const ext of extensions) {
      await db.insert(extensionsTable).values(ext).execute();
    }

    const result = await getExtensions();
    
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Alpha Extension');
    expect(result[1].name).toBe('Beta Extension');
    expect(result[2].name).toBe('Zebra Extension');
  });

  it('should sort monthly installs chronologically', async () => {
    // Create extension
    const extensionResult = await db.insert(extensionsTable).values({
      name: 'Chronological Test',
      description: 'Tests sorting',
      neon_link: 'https://example.com'
    }).returning().execute();
    
    const extensionId = extensionResult[0].id;

    // Create monthly install data in random order
    await db.insert(monthlyInstallsTable).values([
      { extension_id: extensionId, year: 2024, month: 1, installs: 300 },
      { extension_id: extensionId, year: 2023, month: 12, installs: 200 },
      { extension_id: extensionId, year: 2023, month: 11, installs: 100 },
      { extension_id: extensionId, year: 2024, month: 2, installs: 400 }
    ]).execute();

    const result = await getExtensions();
    
    expect(result).toHaveLength(1);
    
    // Should be sorted chronologically
    expect(result[0].monthly_installs).toEqual([
      { year: 2023, month: 11, installs: 100 },
      { year: 2023, month: 12, installs: 200 },
      { year: 2024, month: 1, installs: 300 },
      { year: 2024, month: 2, installs: 400 }
    ]);
    
    expect(result[0].last_month_installs).toBe(400); // Most recent (Feb 2024)
    expect(result[0].total_installs).toBe(1000);
  });
});
