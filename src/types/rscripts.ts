// Rscripts.net API Types
export interface RscriptsResponse {
  success: boolean;
  data: RscriptsScript[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalScripts: number;
    limit: number;
  };
}

export interface RscriptsScript {
  _id: string;
  title: string;
  description?: string;
  script?: string;
  views: number;
  likes: number;
  slug: string;
  verified: boolean;
  universal: boolean;
  keyRequired: boolean;
  game?: {
    name: string;
    imageUrl?: string;
  };
  image?: string;
  updatedAt: string;
  createdAt: string;
}
