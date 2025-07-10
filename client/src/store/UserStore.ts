import { makeAutoObservable } from "mobx";
import { IUser } from "../models/IUser";
import AuthService from "../services/AuthService";
import axios from "axios";
import { API_URL } from "../http";
import { AuthResponse } from "../models/response/AuthResponse";

export default class UserStore {
  user = {} as IUser;
  isAuth = false;
  isLoading = false;
  isActivating = false;

  constructor() {
    makeAutoObservable(this);
  }

  setUser(user: IUser) {
    this.user = user;
  }
  setIsAuth(bool: boolean) {
    this.isAuth = bool;
  }

  setLoading(bool: boolean) {
    this.isLoading = bool;
  }

  setActivating(bool: boolean) {
    this.isActivating = bool;
  }

  async login(email: string, password: string) {
    try {
      const response = await AuthService.login(email, password);
      console.log(response);
      localStorage.setItem("TOKEN", response.data.accessToken);
      this.setIsAuth(true);
      this.setUser(response.data.user);
    } catch (e: any) {
      console.log(e.response?.data?.message);
    }
  }
  async registration(email: string, password: string) {
    try {
      const response = await AuthService.registration(email, password);
      localStorage.setItem("TOKEN", response.data.accessToken);
      this.setActivating(true);
      this.setIsAuth(true);
      this.setUser(response.data.user);
    } catch (e: any) {
      console.log(e.response?.data?.message);
    }
  }
  async activateWithCode(code: string) {
    try {
      const response = await AuthService.activateWithCode(code);
      console.log(response);
      this.setIsAuth(true);
      this.setActivating(false);
      this.user.isActivated = true;
    } catch (e) {
      console.log(e);
    }
  }
  async logout() {
    try {
      const response = await AuthService.logout();
      localStorage.removeItem("TOKEN");
      this.setIsAuth(false);
      this.setUser({} as IUser);
    } catch (e: any) {
      console.log(e.response?.data?.message);
    }
  }

  async checkAuth() {
    this.setLoading(true);
    try {
      const response = await axios.get<AuthResponse>(`${API_URL}/refresh`, {
        withCredentials: true,
      });
      console.log(response);
      localStorage.setItem("TOKEN", response.data.accessToken);
      this.setIsAuth(true);
      this.setUser(response.data.user);
    } catch (e: any) {
      console.log(e.response?.data?.message);
    } finally {
      this.setLoading(false);
    }
  }
}
