// A library of FICTIONAL companies. None of these are real, and every price is generated on the device.
export type Sector =
  | 'Technology' | 'Semiconductors' | 'Software' | 'Healthcare' | 'Biotech' | 'Financials'
  | 'Energy' | 'Consumer' | 'Retail' | 'Industrials' | 'Autos' | 'Media' | 'Utilities' | 'Index';

export type Stock = {
  symbol: string;
  name: string;
  sector: Sector;
  base: number; // starting price
  vol: number; // typical daily volatility (fraction)
  drift: number; // long-run daily drift (fraction)
  avgVol: number; // typical shares per minute
  spreadBps: number;
};

const S = (symbol: string, name: string, sector: Sector, base: number, vol: number, drift: number, avgVol: number, spreadBps = 2): Stock =>
  ({ symbol, name, sector, base, vol, drift, avgVol, spreadBps });

export const UNIVERSE: Stock[] = [
  S('NOVA', 'Nova Systems', 'Technology', 182, 0.017, 0.0004, 9000),
  S('QBIT', 'Qubit Labs', 'Technology', 96, 0.026, 0.0003, 7000),
  S('HELX', 'Helix Devices', 'Technology', 245, 0.015, 0.0003, 6500),
  S('PIXL', 'Pixelworks Group', 'Technology', 61, 0.022, 0.0002, 8000),
  S('ARCN', 'Arcane Chips', 'Semiconductors', 138, 0.029, 0.0005, 9500),
  S('VOLT', 'Voltaic Silicon', 'Semiconductors', 74, 0.033, 0.0004, 7500),
  S('TRON', 'Tronix Micro', 'Semiconductors', 312, 0.024, 0.0004, 5200),
  S('CLDY', 'Cloudly Inc', 'Software', 128, 0.023, 0.0004, 6000),
  S('SYNK', 'Synkro Software', 'Software', 54, 0.027, 0.0002, 7000),
  S('DATM', 'Datamine Corp', 'Software', 205, 0.02, 0.0004, 4800),
  S('CODX', 'Codex Cyber', 'Software', 87, 0.03, 0.0003, 5400),
  S('MEDI', 'Medivance Health', 'Healthcare', 142, 0.012, 0.0002, 5000),
  S('VITA', 'Vitalis Care', 'Healthcare', 78, 0.014, 0.0002, 5500),
  S('CURA', 'Curalink Pharma', 'Healthcare', 111, 0.013, 0.0003, 4500),
  S('GENE', 'Genewave Bio', 'Biotech', 36, 0.045, 0.0001, 9000, 4),
  S('BIOX', 'Bioxis Therapeutics', 'Biotech', 22, 0.052, 0.0, 12000, 5),
  S('NEUR', 'Neuron Dynamics', 'Biotech', 58, 0.04, 0.0002, 6000, 4),
  S('BANX', 'Banxa Financial', 'Financials', 48, 0.015, 0.0002, 8500),
  S('CAPR', 'Capitol Trust', 'Financials', 163, 0.013, 0.0002, 4200),
  S('LEND', 'Lendwell', 'Financials', 29, 0.026, 0.0002, 9000, 3),
  S('INSR', 'Insura Group', 'Financials', 92, 0.011, 0.0002, 4000),
  S('PETR', 'Petrolon Energy', 'Energy', 67, 0.021, 0.0001, 10000),
  S('SOLR', 'Solarix Power', 'Energy', 31, 0.035, 0.0003, 9500, 3),
  S('WNDX', 'Windex Renewables', 'Energy', 44, 0.03, 0.0002, 7000, 3),
  S('OILD', 'Oildrum Partners', 'Energy', 19, 0.028, 0.0, 12000, 3),
  S('BREW', 'Brewmaster Beverage', 'Consumer', 72, 0.011, 0.0002, 5000),
  S('SNAK', 'Snackwise Foods', 'Consumer', 58, 0.01, 0.0002, 5200),
  S('FITZ', 'Fitzone Apparel', 'Consumer', 104, 0.018, 0.0003, 4400),
  S('LUXE', 'Luxe and Co', 'Consumer', 275, 0.019, 0.0003, 2600),
  S('CART', 'Cartwheel Retail', 'Retail', 118, 0.016, 0.0002, 6500),
  S('MALL', 'Megamall Holdings', 'Retail', 43, 0.024, 0.0001, 8000),
  S('DASH', 'Dashdrop Delivery', 'Retail', 38, 0.033, 0.0002, 8800, 3),
  S('GEAR', 'Gearbox Industrial', 'Industrials', 154, 0.014, 0.0002, 4000),
  S('RAIL', 'Railbound Freight', 'Industrials', 201, 0.012, 0.0002, 3200),
  S('JETS', 'Jetstream Aerospace', 'Industrials', 133, 0.019, 0.0003, 4600),
  S('BOLT', 'Boltcar Motors', 'Autos', 247, 0.034, 0.0003, 9800),
  S('ROAD', 'Roadster Auto', 'Autos', 15, 0.025, 0.0, 12000, 3),
  S('EVOL', 'Evolve Mobility', 'Autos', 33, 0.046, 0.0001, 9000, 4),
  S('STRM', 'Streamline Media', 'Media', 83, 0.021, 0.0002, 6800),
  S('PLAY', 'Playground Games', 'Media', 107, 0.025, 0.0003, 5600),
  S('BEAT', 'Beatbox Audio', 'Media', 26, 0.034, 0.0001, 8200, 3),
  S('AQUA', 'Aquaflow Utilities', 'Utilities', 64, 0.008, 0.0001, 4200),
  S('GRID', 'Gridline Electric', 'Utilities', 79, 0.009, 0.0001, 4600),
  S('GASX', 'Gasworks Co-op', 'Utilities', 52, 0.01, 0.0001, 3900),
  S('MKTX', 'Market-X Total Fund (simulated index)', 'Index', 420, 0.0085, 0.0003, 20000, 1),
  S('TECX', 'Tech-X Sector Fund (simulated index)', 'Index', 310, 0.013, 0.0004, 14000, 1),
  S('SMLX', 'Small-X Index Fund (simulated index)', 'Index', 190, 0.012, 0.0002, 12000, 1),
  S('BNDX', 'Bond-X Income Fund (simulated index)', 'Index', 74, 0.0035, 0.00005, 9000, 1),
];

export const BY_SYMBOL: Record<string, Stock> = Object.fromEntries(UNIVERSE.map((s) => [s.symbol, s]));
export const SECTORS: Sector[] = Array.from(new Set(UNIVERSE.map((s) => s.sector)));
export const DEFAULT_WATCHLIST = ['NOVA', 'ARCN', 'BOLT', 'MKTX', 'CLDY', 'PETR', 'BANX', 'GENE'];
