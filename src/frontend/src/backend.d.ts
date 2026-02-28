import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToWatchlist(symbol: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPreferredCurrency(): Promise<string | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWatchlist(): Promise<Array<string>>;
    getWatchlistByUser(user: Principal): Promise<Array<string>>;
    isCallerAdmin(): Promise<boolean>;
    removeFromWatchlist(symbol: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setPreferredCurrency(currency: string): Promise<void>;
}
