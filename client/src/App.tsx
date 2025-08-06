
import { useState, useEffect, useCallback, useMemo } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Moon, Sun, LayoutGrid, Table2, ExternalLink, ArrowUpDown, TrendingUp, AlertCircle } from 'lucide-react';
import type { ExtensionWithInstalls } from '../../server/src/schema';

// Sample extension data for demonstration purposes
const sampleExtensions: ExtensionWithInstalls[] = [
  {
    id: 1,
    name: 'pg_vector',
    description: 'Open-source vector similarity search for Postgres',
    neon_link: 'https://neon.tech/docs/extensions/pg_vector',
    monthly_installs: [
      { year: 2024, month: 11, installs: 2450 },
      { year: 2024, month: 12, installs: 2890 },
      { year: 2025, month: 1, installs: 3210 },
      { year: 2025, month: 2, installs: 3580 },
      { year: 2025, month: 3, installs: 4120 },
      { year: 2025, month: 4, installs: 4650 },
      { year: 2025, month: 5, installs: 5180 },
      { year: 2025, month: 6, installs: 5720 },
      { year: 2025, month: 7, installs: 6280 }
    ],
    last_month_installs: 6280,
    total_installs: 38080,
    created_at: new Date('2024-10-01'),
    updated_at: new Date('2025-07-01')
  },
  {
    id: 2,
    name: 'PostGIS',
    description: 'Spatial and geographic objects support for PostgreSQL',
    neon_link: 'https://neon.tech/docs/extensions/postgis',
    monthly_installs: [
      { year: 2024, month: 11, installs: 1890 },
      { year: 2024, month: 12, installs: 2010 },
      { year: 2025, month: 1, installs: 2180 },
      { year: 2025, month: 2, installs: 2340 },
      { year: 2025, month: 3, installs: 2520 },
      { year: 2025, month: 4, installs: 2680 },
      { year: 2025, month: 5, installs: 2850 },
      { year: 2025, month: 6, installs: 3020 },
      { year: 2025, month: 7, installs: 3200 }
    ],
    last_month_installs: 3200,
    total_installs: 22690,
    created_at: new Date('2024-10-01'),
    updated_at: new Date('2025-07-01')
  },
  {
    id: 3,
    name: 'uuid-ossp',
    description: 'Functions to generate universally unique identifiers (UUIDs)',
    neon_link: 'https://neon.tech/docs/extensions/uuid-ossp',
    monthly_installs: [
      { year: 2024, month: 11, installs: 1520 },
      { year: 2024, month: 12, installs: 1480 },
      { year: 2025, month: 1, installs: 1590 },
      { year: 2025, month: 2, installs: 1650 },
      { year: 2025, month: 3, installs: 1720 },
      { year: 2025, month: 4, installs: 1780 },
      { year: 2025, month: 5, installs: 1850 },
      { year: 2025, month: 6, installs: 1920 },
      { year: 2025, month: 7, installs: 1990 }
    ],
    last_month_installs: 1990,
    total_installs: 15500,
    created_at: new Date('2024-10-01'),
    updated_at: new Date('2025-07-01')
  },
  {
    id: 4,
    name: 'pg_stat_statements',
    description: 'Track planning and execution statistics of all SQL statements',
    neon_link: 'https://neon.tech/docs/extensions/pg_stat_statements',
    monthly_installs: [
      { year: 2024, month: 11, installs: 980 },
      { year: 2024, month: 12, installs: 1050 },
      { year: 2025, month: 1, installs: 1120 },
      { year: 2025, month: 2, installs: 1200 },
      { year: 2025, month: 3, installs: 1280 },
      { year: 2025, month: 4, installs: 1360 },
      { year: 2025, month: 5, installs: 1440 },
      { year: 2025, month: 6, installs: 1520 },
      { year: 2025, month: 7, installs: 1600 }
    ],
    last_month_installs: 1600,
    total_installs: 11550,
    created_at: new Date('2024-10-01'),
    updated_at: new Date('2025-07-01')
  },
  {
    id: 5,
    name: 'pg_trgm',
    description: 'Text similarity measurement and index searching based on trigrams',
    neon_link: 'https://neon.tech/docs/extensions/pg_trgm',
    monthly_installs: [
      { year: 2024, month: 11, installs: 720 },
      { year: 2024, month: 12, installs: 780 },
      { year: 2025, month: 1, installs: 840 },
      { year: 2025, month: 2, installs: 910 },
      { year: 2025, month: 3, installs: 980 },
      { year: 2025, month: 4, installs: 1050 },
      { year: 2025, month: 5, installs: 1120 },
      { year: 2025, month: 6, installs: 1190 },
      { year: 2025, month: 7, installs: 1260 }
    ],
    last_month_installs: 1260,
    total_installs: 8850,
    created_at: new Date('2024-10-01'),
    updated_at: new Date('2025-07-01')
  },
  {
    id: 6,
    name: 'hstore',
    description: 'Data type for storing sets of key/value pairs within a single PostgreSQL value',
    neon_link: 'https://neon.tech/docs/extensions/hstore',
    monthly_installs: [
      { year: 2024, month: 11, installs: 450 },
      { year: 2024, month: 12, installs: 480 },
      { year: 2025, month: 1, installs: 510 },
      { year: 2025, month: 2, installs: 540 },
      { year: 2025, month: 3, installs: 570 },
      { year: 2025, month: 4, installs: 600 },
      { year: 2025, month: 5, installs: 630 },
      { year: 2025, month: 6, installs: 660 },
      { year: 2025, month: 7, installs: 690 }
    ],
    last_month_installs: 690,
    total_installs: 5130,
    created_at: new Date('2024-10-01'),
    updated_at: new Date('2025-07-01')
  },
  {
    id: 7,
    name: 'pg_crypto',
    description: 'Cryptographic functions for PostgreSQL',
    neon_link: 'https://neon.tech/docs/extensions/pgcrypto',
    monthly_installs: [
      { year: 2024, month: 11, installs: 320 },
      { year: 2024, month: 12, installs: 350 },
      { year: 2025, month: 1, installs: 380 },
      { year: 2025, month: 2, installs: 410 },
      { year: 2025, month: 3, installs: 440 },
      { year: 2025, month: 4, installs: 470 },
      { year: 2025, month: 5, installs: 500 },
      { year: 2025, month: 6, installs: 530 },
      { year: 2025, month: 7, installs: 560 }
    ],
    last_month_installs: 560,
    total_installs: 3960,
    created_at: new Date('2024-10-01'),
    updated_at: new Date('2025-07-01')
  },
  {
    id: 8,
    name: 'btree_gin',
    description: 'Support for indexing common data types in GIN',
    neon_link: 'https://neon.tech/docs/extensions/btree_gin',
    monthly_installs: [
      { year: 2024, month: 11, installs: 180 },
      { year: 2024, month: 12, installs: 195 },
      { year: 2025, month: 1, installs: 210 },
      { year: 2025, month: 2, installs: 225 },
      { year: 2025, month: 3, installs: 240 },
      { year: 2025, month: 4, installs: 255 },
      { year: 2025, month: 5, installs: 270 },
      { year: 2025, month: 6, installs: 285 },
      { year: 2025, month: 7, installs: 300 }
    ],
    last_month_installs: 300,
    total_installs: 2160,
    created_at: new Date('2024-10-01'),
    updated_at: new Date('2025-07-01')
  }
];

// Sparkline component for monthly install trends
function Sparkline({ data }: { data: Array<{ year: number; month: number; installs: number }> }) {
  const sortedData = useMemo(() => 
    [...data].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    }), [data]
  );

  const maxValue = Math.max(...sortedData.map(d => d.installs));
  const minValue = Math.min(...sortedData.map(d => d.installs));
  const range = maxValue - minValue || 1;

  if (sortedData.length < 2) {
    return <div className="w-20 h-8 flex items-center justify-center text-xs text-muted-foreground">No data</div>;
  }

  const points = sortedData.map((d, i) => ({
    x: (i / (sortedData.length - 1)) * 80,
    y: 24 - ((d.installs - minValue) / range) * 20
  }));

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="w-20 h-8 flex items-center">
      <svg width="80" height="32" className="overflow-visible">
        <path
          d={pathData}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-primary"
        />
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="1.5"
            fill="currentColor"
            className="text-primary"
          />
        ))}
      </svg>
    </div>
  );
}

// Extension card component
function ExtensionCard({ 
  extension, 
  onClick 
}: { 
  extension: ExtensionWithInstalls; 
  onClick: () => void;
}) {
  return (
    <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-1">{extension.name}</CardTitle>
          <Badge variant="secondary" className="ml-2 shrink-0">
            {extension.last_month_installs.toLocaleString()}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 text-sm">
          {extension.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <Sparkline data={extension.monthly_installs} />
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total installs</div>
            <div className="font-semibold">{extension.total_installs.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Extension detail modal
function ExtensionModal({ 
  extension, 
  onClose 
}: { 
  extension: ExtensionWithInstalls | null; 
  onClose: () => void;
}) {
  useEffect(() => {
    if (extension) {
      // Update URL with extension ID for shareability
      const newUrl = `${window.location.origin}${window.location.pathname}?extension=${extension.id}`;
      window.history.pushState({}, '', newUrl);
      
      // Update meta tags for social sharing
      document.title = `${extension.name} - Postgres Extension Analytics`;
      
      // Update or create Open Graph meta tags
      let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.content = extension.name;
      
      let ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.content = extension.description;
      
      let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.content = newUrl;
    } else {
      // Reset URL and meta tags
      window.history.pushState({}, '', window.location.pathname);
      document.title = 'Postgres Extension Analytics';
    }
  }, [extension]);

  if (!extension) return null;

  return (
    <Dialog open={!!extension} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{extension.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-muted-foreground">{extension.description}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Last Month Installs</div>
              <div className="text-3xl font-bold">{extension.last_month_installs.toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Total Installs</div>
              <div className="text-3xl font-bold">{extension.total_installs.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm font-medium">Monthly Install Trend</div>
            <div className="h-32 flex items-center justify-center">
              <div className="w-full max-w-md">
                <Sparkline data={extension.monthly_installs} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              {extension.monthly_installs.slice(-3).map((install, i) => (
                <div key={i} className="text-center">
                  <div>{install.year}-{String(install.month).padStart(2, '0')}</div>
                  <div className="font-medium">{install.installs.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button asChild>
              <a 
                href={extension.neon_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                View on Neon
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function App() {
  const [extensions, setExtensions] = useState<ExtensionWithInstalls[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExtension, setSelectedExtension] = useState<ExtensionWithInstalls | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference or default to system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [sortConfig, setSortConfig] = useState<{
    key: 'name' | 'last_month_installs';
    direction: 'asc' | 'desc';
  } | null>(null);

  // Load extensions with robust error handling and immediate fallback
  const loadExtensions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Set a timeout to prevent hanging on failed requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 3000)
      );
      
      const apiPromise = trpc.getExtensions.query();
      const result = await Promise.race([apiPromise, timeoutPromise]) as ExtensionWithInstalls[];
      
      if (result && Array.isArray(result) && result.length > 0) {
        setExtensions(result);
      } else {
        throw new Error('No data received from API');
      }
    } catch (error) {
      console.error('API failed, using sample data:', error);
      setError('Using demonstration data - API connection unavailable');
      // Always fall back to sample data
      setExtensions(sampleExtensions);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for extension ID in URL on load
  const checkUrlForExtension = useCallback((extensionData: ExtensionWithInstalls[]) => {
    const urlParams = new URLSearchParams(window.location.search);
    const extensionId = urlParams.get('extension');
    if (extensionId && extensionData.length > 0) {
      try {
        const extensionIdNum = parseInt(extensionId);
        const extension = extensionData.find(ext => ext.id === extensionIdNum);
        if (extension) {
          setSelectedExtension(extension);
        }
      } catch (error) {
        console.error('Failed to parse extension ID from URL:', error);
      }
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    loadExtensions();
  }, [loadExtensions]);

  // Check URL for extension after data is loaded
  useEffect(() => {
    if (extensions.length > 0) {
      checkUrlForExtension(extensions);
    }
  }, [extensions, checkUrlForExtension]);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Sort extensions
  const sortedExtensions = useMemo(() => {
    if (!sortConfig) return extensions;

    return [...extensions].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortConfig.key === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else {
        aValue = a.last_month_installs;
        bValue = b.last_month_installs;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [extensions, sortConfig]);

  const handleSort = (key: 'name' | 'last_month_installs') => {
    setSortConfig(prevConfig => {
      if (prevConfig?.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleExtensionClick = (extension: ExtensionWithInstalls) => {
    setSelectedExtension(extension);
  };

  const handleCloseModal = () => {
    setSelectedExtension(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading extension data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Postgres Extension Analytics</h1>
              <p className="text-muted-foreground mt-2">
                Track adoption trends for Postgres extensions on Neon
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="h-8 px-3"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-8 px-3"
                >
                  <Table2 className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Dark Mode Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="h-8 px-3"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedExtensions.map((extension: ExtensionWithInstalls) => (
              <ExtensionCard
                key={extension.id}
                extension={extension}
                onClick={() => handleExtensionClick(extension)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('name')}
                      className="font-semibold flex items-center gap-2 h-auto p-0"
                    >
                      Extension Name
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Monthly Trend</TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('last_month_installs')}
                      className="font-semibold flex items-center gap-2 h-auto p-0 ml-auto"
                    >
                      Last Month
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Total Installs</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExtensions.map((extension: ExtensionWithInstalls) => (
                  <TableRow 
                    key={extension.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleExtensionClick(extension)}
                  >
                    <TableCell className="font-medium">{extension.name}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={extension.description}>
                        {extension.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Sparkline data={extension.monthly_installs} />
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {extension.last_month_installs.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {extension.total_installs.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        <a 
                          href={extension.neon_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
        
        {extensions.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No extensions found</p>
          </div>
        )}
      </main>

      {/* Extension Detail Modal */}
      <ExtensionModal 
        extension={selectedExtension}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default App;
