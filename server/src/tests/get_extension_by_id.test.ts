
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { extensionsTable, monthlyInstallsTable } from '../db/schema';
import { type GetExtensionByIdInput } from '../schema';
import { getExtensionById } from '../handlers/get_extension_by_id';

describe('getExtensionById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return extension with monthly installs', async () => {
    // Create test extension
    const extensionResult = await db.insert(extensionsTable)
      .values({
        name: 'Test Extension',
        description: 'A test extension',
        neon_link: 'https://example.com/test'
      })
      .returning()
      .execute();

    const extension = extensionResult[0];

    // Create monthly install data
    await db.insert(monthlyInstallsTable)
      .values([
        {
          extension_id: extension.id,
          year: 2024,
          month: 1,
          installs: 100
        },
        {
          extension_id: extension.id,
          year: 2024,
          month: 2,
          installs: 150
        }
      ])
      .execute();

    const input: GetExtensionByIdInput = { id: extension.id };
    const result = await getExtensionById(input);

    expect(result).toBeDefined();
    expect(result!.id).toBe(extension.id);
    expect(result!.name).toBe('Test Extension');
    expect(result!.description).toBe('A test extension');
    expect(result!.neon_link).toBe('https://example.com/test');
    expect(result!.monthly_installs).toHaveLength(2);
    expect(result!.total_installs).toBe(250);
    expect(result!.last_month_installs).toBe(150);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return extension with no monthly installs', async () => {
    // Create test extension without monthly installs
    const extensionResult = await db.insert(extensionsTable)
      .values({
        name: 'Empty Extension',
        description: 'An extension with no installs',
        neon_link: 'https://example.com/empty'
      })
      .returning()
      .execute();

    const extension = extensionResult[0];

    const input: GetExtensionByIdInput = { id: extension.id };
    const result = await getExtensionById(input);

    expect(result).toBeDefined();
    expect(result!.id).toBe(extension.id);
    expect(result!.name).toBe('Empty Extension');
    expect(result!.monthly_installs).toHaveLength(0);
    expect(result!.total_installs).toBe(0);
    expect(result!.last_month_installs).toBe(0);
  });

  it('should return null for non-existent extension', async () => {
    const input: GetExtensionByIdInput = { id: 999 };
    const result = await getExtensionById(input);

    expect(result).toBeNull();
  });

  it('should sort monthly installs by year and month', async () => {
    // Create test extension
    const extensionResult = await db.insert(extensionsTable)
      .values({
        name: 'Sort Test Extension',
        description: 'Testing sorting',
        neon_link: 'https://example.com/sort'
      })
      .returning()
      .execute();

    const extension = extensionResult[0];

    // Create monthly install data in random order
    await db.insert(monthlyInstallsTable)
      .values([
        {
          extension_id: extension.id,
          year: 2024,
          month: 3,
          installs: 300
        },
        {
          extension_id: extension.id,
          year: 2023,
          month: 12,
          installs: 200
        },
        {
          extension_id: extension.id,
          year: 2024,
          month: 1,
          installs: 100
        }
      ])
      .execute();

    const input: GetExtensionByIdInput = { id: extension.id };
    const result = await getExtensionById(input);

    expect(result).toBeDefined();
    expect(result!.monthly_installs).toHaveLength(3);
    
    // Check sorting: should be chronological order
    expect(result!.monthly_installs[0]).toEqual({
      year: 2023,
      month: 12,
      installs: 200
    });
    expect(result!.monthly_installs[1]).toEqual({
      year: 2024,
      month: 1,
      installs: 100
    });
    expect(result!.monthly_installs[2]).toEqual({
      year: 2024,
      month: 3,
      installs: 300
    });
    
    expect(result!.total_installs).toBe(600);
    expect(result!.last_month_installs).toBe(300); // Latest chronologically
  });
});
