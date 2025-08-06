
import { type CreateExtensionInput, type Extension } from '../schema';
import { db } from '../db';
import { extensionsTable } from '../db/schema';

export async function createExtension(input: CreateExtensionInput): Promise<Extension> {
  try {
    const [newExtension] = await db
      .insert(extensionsTable)
      .values({
        name: input.name,
        description: input.description,
        neon_link: input.neon_link,
        updated_at: new Date()
      })
      .returning();
    
    return newExtension;
  } catch (error) {
    console.error('Error creating extension:', error);
    throw error;
  }
}
