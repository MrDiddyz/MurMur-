export type ModuleCategory = 'Business' | 'Creative' | 'Personal' | 'Systems';

export type LearningModule = {
  slug: string;
  name: string;
  category: ModuleCategory;
  description: string;
  outcomes: string[];
  timeline: string;
  priceFrom: string;
};

export type MetadataArtifact = {
  id: string;
  artworkId: string;
  userId: string;
  name: string;
  description: string;
  metadataJson: unknown;
  cid: string;
  ipfsUri: string;
  createdAt: string;
};
