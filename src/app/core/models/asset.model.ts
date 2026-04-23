export interface Asset {
  id: string;
  name: string;
  type: 'svg' | 'html' | 'angular' | 'other';
  description: string;
  file: string;
  tags?: string[];
  addedBy: string;
  date: string;
}

export const ASSET_TYPES = ['svg', 'html', 'angular', 'other'] as const;
export type AssetType = typeof ASSET_TYPES[number];
