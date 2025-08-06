
import { type GetExtensionByNameInput, type ExtensionWithInstalls } from '../schema';
import { db } from '../db';
import { extensionsTable, monthlyInstallsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function getExtensionByName(input: GetExtensionByNameInput): Promise<ExtensionWithInstalls | null> {
    // This is a placeholder implementation! Real code should be implemented here.
    // The goal of this handler is fetching a specific extension by name with all its monthly install data
    // for SEO-friendly URLs and social media sharing deeplinks.
    
    try {
        // Get extension with monthly install data by name
        const extensionWithInstalls = await db
            .select()
            .from(extensionsTable)
            .leftJoin(monthlyInstallsTable, eq(extensionsTable.id, monthlyInstallsTable.extension_id))
            .where(eq(extensionsTable.name, input.name));
        
        if (extensionWithInstalls.length === 0) {
            return null;
        }
        
        const extension = extensionWithInstalls[0].extensions;
        const monthlyInstalls = extensionWithInstalls
            .filter(row => row.monthly_installs !== null)
            .map(row => ({
                year: row.monthly_installs!.year,
                month: row.monthly_installs!.month,
                installs: row.monthly_installs!.installs
            }))
            .sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.month - b.month;
            });
        
        const totalInstalls = monthlyInstalls.reduce((sum, install) => sum + install.installs, 0);
        const lastMonthInstalls = monthlyInstalls.length > 0 
            ? monthlyInstalls[monthlyInstalls.length - 1].installs 
            : 0;
        
        return {
            id: extension.id,
            name: extension.name,
            description: extension.description,
            neon_link: extension.neon_link,
            monthly_installs: monthlyInstalls,
            last_month_installs: lastMonthInstalls,
            total_installs: totalInstalls,
            created_at: extension.created_at,
            updated_at: extension.updated_at
        };
    } catch (error) {
        console.error('Error fetching extension by name:', error);
        return null;
    }
}
