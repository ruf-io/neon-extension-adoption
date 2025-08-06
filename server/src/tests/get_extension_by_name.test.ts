
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { extensionsTable, monthlyInstallsTable } from '../db/schema';
import { type GetExtensionByNameInput } from '../schema';
import { getExtensionByName } from '../handlers/get_extension_by_name';

describe('getExtensionByName', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null for non-existent extension', async () => {
    const input: GetExtensionByNameInput = {
      name: 'nonexistent-extension'
    };

    const result = await getExtensionByName(input);

    expect(result).toBeNull();
  });

  it('should return extension without monthly installs', async () => {
    // Create test extension
    const extensionResult = await db.insert(extensionsTable)
      .values({
        name: 'test-extension',
        description: 'A test extension',
        neon_link: 'https://neon.tech/test'
      })
      .returning()
      .execute();

    const input: GetExtensionByNameInput = {
      name: 'test-extension'
    };

    const result = await getExtensionByName(input);

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('test-extension');
    expect(result!.description).toEqual('A test extension');
    expect(result!.neon_link).toEqual('https://neon.tech/test');
    expect(result!.monthly_installs).toEqual([]);
    expect(result!.last_month_installs).toEqual(0);
    expect(result!.total_installs).toEqual(0);
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return extension with monthly installs data', async () => {
    // Create test extension
    const extensionResult = await db.insert(extensionsTable)
      .values({
        name: 'popular-extension',
        description: 'A popular extension',
        neon_link: 'https://neon.tech/popular'
      })
      .returning()
      .execute();

    const extensionId = extensionResult[0].id;

    // Create monthly install data
    await db.insert(monthlyInstallsTable)
      .values([
        {
          extension_id: extensionId,
          year: 2023,
          month: 10,
          installs: 100
        },
        {
          extension_id: extensionId,
          year: 2023,
          month: 11,
          installs: 150
        },
        {
          extension_id: extensionId,
          year: 2023,
          month: 12,
          installs: 200
        }
      ])
      .execute();

    const input: GetExtensionByNameInput = {
      name: 'popular-extension'
    };

    const result = await getExtensionByName(input);

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('popular-extension');
    expect(result!.description).toEqual('A popular extension');
    expect(result!.neon_link).toEqual('https://neon.tech/popular');
    
    // Verify monthly installs are sorted chronologically
    expect(result!.monthly_installs).toHaveLength(3);
    expect(result!.monthly_installs[0]).toEqual({ year: 2023, month: 10, installs: 100 });
    expect(result!.monthly_installs[1]).toEqual({ year: 2023, month: 11, installs: 150 });
    expect(result!.monthly_installs[2]).toEqual({ year: 2023, month: 12, installs: 200 });
    
    // Verify calculated totals
    expect(result!.total_installs).toEqual(450);
    expect(result!.last_month_installs).toEqual(200);
  });

  it('should handle extensions with mixed year monthly installs', async () => {
    // Create test extension
    const extensionResult = await db.insert(extensionsTable)
      .values({
        name: 'mixed-year-extension',
        description: 'Extension with mixed year data',
        neon_link: 'https://neon.tech/mixed'
      })
      .returning()
      .execute();

    const extensionId = extensionResult[0].id;

    // Create monthly install data across years (unsorted order)
    await db.insert(monthlyInstallsTable)
      .values([
        {
          extension_id: extensionId,
          year: 2024,
          month: 2,
          installs: 300
        },
        {
          extension_id: extensionId,
          year: 2023,
          month: 12,
          installs: 200
        },
        {
          extension_id: extensionId,
          year: 2024,
          month: 1,
          installs: 250
        }
      ])
      .execute();

    const input: GetExtensionByNameInput = {
      name: 'mixed-year-extension'
    };

    const result = await getExtensionByName(input);

    expect(result).not.toBeNull();
    
    // Verify monthly installs are sorted chronologically
    expect(result!.monthly_installs).toHaveLength(3);
    expect(result!.monthly_installs[0]).toEqual({ year: 2023, month: 12, installs: 200 });
    expect(result!.monthly_installs[1]).toEqual({ year: 2024, month: 1, installs: 250 });
    expect(result!.monthly_installs[2]).toEqual({ year: 2024, month: 2, installs: 300 });
    
    // Verify calculated totals
    expect(result!.total_installs).toEqual(750);
    expect(result!.last_month_installs).toEqual(300); // Most recent chronologically
  });

  it('should be case sensitive for extension names', async () => {
    // Create test extension
    await db.insert(extensionsTable)
      .values({
        name: 'CaseSensitive',
        description: 'Case sensitive test',
        neon_link: 'https://neon.tech/case'
      })
      .execute();

    const correctInput: GetExtensionByNameInput = {
      name: 'CaseSensitive'
    };

    const incorrectInput: GetExtensionByNameInput = {
      name: 'casesensitive'
    };

    const correctResult = await getExtensionByName(correctInput);
    const incorrectResult = await getExtensionByName(incorrectInput);

    expect(correctResult).not.toBeNull();
    expect(correctResult!.name).toEqual('CaseSensitive');
    expect(incorrectResult).toBeNull();
  });
});
