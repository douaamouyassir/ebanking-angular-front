import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http:HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(environment.backendHost + "/login", {username, password});
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post(environment.backendHost + "/register", {username, password});
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  saveRoles(roles: string[]) {
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  getRoles(): string[] {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }

  isAdmin(): boolean {
    return this.getRoles().includes('ADMIN');
  }

  isAuthenticated(): boolean {
    return this.getToken() != null;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
  }
}

