import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {AccountDetails} from "../model/account.model";

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  constructor(private http : HttpClient) { }

  public getAccount(accountId : string, page : number, size : number):Observable<AccountDetails>{
    // Nettoyer l'ID du compte pour éviter les espaces ou caractères indésirables
    const cleanAccountId = accountId.trim();
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<AccountDetails>(`${environment.backendHost}/accounts/${cleanAccountId}/pageOperations`, { params });
  }
  public debit(accountId : string, amount : number, description:string){
    // Nettoyer et valider les données avant envoi
    const cleanAccountId = accountId.trim();
    const cleanDescription = description?.trim() || '';
    
    // Essayer avec accountId (camelCase) - format le plus commun pour Spring Boot
    const data = {
      accountId: cleanAccountId,
      amount: Number(amount),
      description: cleanDescription || null
    };
    
    console.log("Sending debit request:", JSON.stringify(data, null, 2));
    console.log("URL:", `${environment.backendHost}/accounts/debit`);
    
    return this.http.post(`${environment.backendHost}/accounts/debit`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  public credit(accountId : string, amount : number, description:string){
    // Nettoyer et valider les données avant envoi
    const cleanAccountId = accountId.trim();
    const cleanDescription = description?.trim() || '';
    
    const data = {
      accountId: cleanAccountId,
      amount: Number(amount),
      description: cleanDescription || null
    };
    
    console.log("Sending credit request:", JSON.stringify(data, null, 2));
    console.log("URL:", `${environment.backendHost}/accounts/credit`);
    
    return this.http.post(`${environment.backendHost}/accounts/credit`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  public transfer(accountSource: string, accountDestination: string, amount : number, description:string){
    // Nettoyer et valider les données avant envoi
    const cleanSource = accountSource.trim();
    const cleanDestination = accountDestination.trim();
    const cleanDescription = description?.trim() || '';
    
    const data = {
      accountSource: cleanSource,
      accountDestination: cleanDestination,
      amount: Number(amount),
      description: cleanDescription || null
    };
    
    console.log("Sending transfer request:", JSON.stringify(data, null, 2));
    console.log("URL:", `${environment.backendHost}/accounts/transfer`);
    
    return this.http.post(`${environment.backendHost}/accounts/transfer`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
