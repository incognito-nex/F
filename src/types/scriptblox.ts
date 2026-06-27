// ScriptBlox API Types
export interface ScriptBloxResponse {
  result: {
    totalPages: number;
    currentPage: number;
    docs: ScriptBloxDoc[];
  };
}

export interface ScriptBloxDoc {
  _id: string;
  title: string;
  features?: string;
  game: {
    name: string;
    gameId?: number;
    imageUrl?: string;
  };
  script: string;
  views: number;
  likeCount?: number;
  verified: boolean;
  patched: boolean;
  key: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}
