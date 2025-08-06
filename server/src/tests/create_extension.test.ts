
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { extensionsTable } from '../db/schema';
import { type CreateExtensionInput } from '../schema';
import { createExtension } from '../handlers/create_extension';
import { eq } from 'drizzle-orm';

const testInput: CreateExtensionInput = {
  name: 'pgvector',
  description: 'Open-source vector similarity search for Postgres',
  neon_link: 'https://neon.tech/docs/extensions/pgvector'
};

describe('createExtension', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an extension', async () => {
    const result = await createExtension(testInput);

    expect(result.name).toEqual('pgvector');
    expect(result.description).toEqual('Open-source vector similarity search for Postgres');
    expect(result.neon_link).toEqual('https://neon.tech/docs/extensions/pgvector');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save extension to database', async () => {
    const result = await createExtension(testInput);

    const extensions = await db.select()
      .from(extensionsTable)
      .where(eq(extensionsTable.id, result.id))
      .execute();

    expect(extensions).toHaveLength(1);
    expect(extensions[0].name).toEqual('pgvector');
    expect(extensions[0].description).toEqual('Open-source vector similarity search for Postgres');
    expect(extensions[0].neon_link).toEqual('https://neon.tech/docs/extensions/pgvector');
    expect(extensions[0].created_at).toBeInstanceOf(Date);
    expect(extensions[0].updated_at).toBeInstanceOf(Date);
  });

  it('should enforce unique name constraint', async () => {
    await createExtension(testInput);

    await expect(createExtension(testInput)).rejects.toThrow(/unique/i);
  });

  it('should create extension with different valid inputs', async () => {
    const secondInput: CreateExtensionInput = {
      name: 'uuid-ossp',
      description: 'Provides functions to generate universally unique identifiers',
      neon_link: 'https://neon.tech/docs/extensions/uuid-ossp'
    };

    const result = await createExtension(secondInput);

    expect(result.name).toEqual('uuid-ossp');
    expect(result.description).toEqual('Provides functions to generate universally unique identifiers');
    expect(result.neon_link).toEqual('https://neon.tech/docs/extensions/uuid-ossp');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});
