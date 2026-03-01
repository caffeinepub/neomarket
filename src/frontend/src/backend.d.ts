import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface QuestionAnswerPair {
    question: string;
    answer: string;
}
export interface CheatSheet {
    title: string;
    content: Array<QuestionAnswerPair>;
    createdAt: bigint;
}
export interface CheatSheetInput {
    title: string;
    content: Array<QuestionAnswerPair>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSheet(sheet: CheatSheetInput): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteSheet(title: string): Promise<void>;
    getAllSheets(): Promise<Array<CheatSheet>>;
    getCallerUserRole(): Promise<UserRole>;
    getSheetsForUser(user: Principal): Promise<Array<CheatSheet>>;
    isCallerAdmin(): Promise<boolean>;
}
