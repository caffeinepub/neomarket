export type Lifestyle = "active" | "homebody" | "adventurer" | "creative";

export interface MockUser {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "nonbinary";
  location: string;
  lifestyle: Lifestyle;
  hobbies: string[];
  interests: string[];
  bio: string;
  avatarUrl: string;
  isVerified: boolean;
  likeCount: number;
  isOnline: boolean;
  isAdmin?: boolean;
}

export interface RegisteredUser extends MockUser {
  passwordHash: string;
  joinedAt: number;
  lastActive: number;
  profileViews: number;
}
