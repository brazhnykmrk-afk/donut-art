/** View models shared between the service layer and UI components. */

export interface ArtworkCardData {
  id: string;
  title: string;
  imageUrl: string;
  price: string | null;
  published: boolean;
  createdAt: string;
  authorNickname: string;
  authorAvatarUrl: string | null;
}

export interface ArtworkDetailData extends ArtworkCardData {
  description: string;
  authorId: string;
  authorDiscord: string | null;
}

export interface CreatorCardData {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  bio: string | null;
  artworkCount: number;
  averageRating: number;
  reviewCount: number;
  joinedAt: string;
}

export interface CreatorProfileData extends CreatorCardData {
  discordUsername: string | null;
  artworks: ArtworkCardData[];
  reviews: ReviewData[];
}

export interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  authorId: string;
  authorNickname: string;
  authorAvatarUrl: string | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
}
