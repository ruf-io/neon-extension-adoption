
import { type ExtensionWithInstalls } from '../schema';
import { db } from '../db';
import { extensionsTable, monthlyInstallsTable } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getExtensions(): Promise<ExtensionWithInstalls[]> {
    // This is a placeholder implementation! Real code should be implemented here.
    // The goal of this handler is fetching all extensions with their monthly install data,
    // calculating last month installs and total installs for the visualization dashboard.
    
    try {
        // Get all extensions with their monthly install data
        const extensionsWithInstalls = await db
            .select()
            .from(extensionsTable)
            .leftJoin(monthlyInstallsTable, eq(extensionsTable.id, monthlyInstallsTable.extension_id))
            .orderBy(extensionsTable.name);

        // Group and process the data to match ExtensionWithInstalls schema
        const extensionsMap = new Map<number, ExtensionWithInstalls>();
        
        for (const row of extensionsWithInstalls) {
            const extension = row.extensions;
            const install = row.monthly_installs;
            
            if (!extensionsMap.has(extension.id)) {
                extensionsMap.set(extension.id, {
                    id: extension.id,
                    name: extension.name,
                    description: extension.description,
                    neon_link: extension.neon_link,
                    monthly_installs: [],
                    last_month_installs: 0,
                    total_installs: 0,
                    created_at: extension.created_at,
                    updated_at: extension.updated_at
                });
            }
            
            const extensionData = extensionsMap.get(extension.id)!;
            
            if (install) {
                extensionData.monthly_installs.push({
                    year: install.year,
                    month: install.month,
                    installs: install.installs
                });
                extensionData.total_installs += install.installs;
            }
        }
        
        // Calculate last month installs and sort monthly data
        const result = Array.from(extensionsMap.values()).map(extension => {
            // Sort monthly installs by year and month
            extension.monthly_installs.sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.month - b.month;
            });
            
            // Get last month installs (most recent month)
            if (extension.monthly_installs.length > 0) {
                extension.last_month_installs = extension.monthly_installs[extension.monthly_installs.length - 1].installs;
            }
            
            return extension;
        });
        
        return result;
    } catch (error) {
        console.error('Error fetching extensions:', error);
        return [];
    }
}
