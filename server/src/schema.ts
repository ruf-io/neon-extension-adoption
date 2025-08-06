
import { z } from 'zod';

// Extension schema
export const extensionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  neon_link: z.string().url(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Extension = z.infer<typeof extensionSchema>;

// Monthly install data schema
export const monthlyInstallSchema = z.object({
  id: z.number(),
  extension_id: z.number(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  installs: z.number().int().nonnegative(),
  created_at: z.coerce.date()
});

export type MonthlyInstall = z.infer<typeof monthlyInstallSchema>;

// Combined extension with install data
export const extensionWithInstallsSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  neon_link: z.string().url(),
  monthly_installs: z.array(z.object({
    year: z.number().int(),
    month: z.number().int(),
    installs: z.number().int()
  })),
  last_month_installs: z.number().int(),
  total_installs: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type ExtensionWithInstalls = z.infer<typeof extensionWithInstallsSchema>;

// Input schemas
export const createExtensionInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  neon_link: z.string().url()
});

export type CreateExtensionInput = z.infer<typeof createExtensionInputSchema>;

export const createMonthlyInstallInputSchema = z.object({
  extension_id: z.number(),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  installs: z.number().int().nonnegative()
});

export type CreateMonthlyInstallInput = z.infer<typeof createMonthlyInstallInputSchema>;

export const bulkCreateMonthlyInstallsInputSchema = z.object({
  installs: z.array(createMonthlyInstallInputSchema)
});

export type BulkCreateMonthlyInstallsInput = z.infer<typeof bulkCreateMonthlyInstallsInputSchema>;

// Query parameters
export const getExtensionByIdInputSchema = z.object({
  id: z.number()
});

export type GetExtensionByIdInput = z.infer<typeof getExtensionByIdInputSchema>;

export const getExtensionByNameInputSchema = z.object({
  name: z.string()
});

export type GetExtensionByNameInput = z.infer<typeof getExtensionByNameInputSchema>;
