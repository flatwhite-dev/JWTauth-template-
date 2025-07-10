import { IUser } from "../IUser";

export interface AuthResponse {
  refreshToken: string;
  accessToken: string;
  user: IUser;
}
