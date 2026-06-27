// Shared normalized Script interface
export interface Script {
  id: string;
  title: string;
  description?: string;
  gameName: string;
  gameImage?: string;
  image?: string;
  verified: boolean;
  universal: boolean;
  key: boolean;
  views: number;
  likes?: number;
  updatedAt: string;
  source: "Rscripts" | "ScriptBlox";
  script?: string;
  features?: string;
}
