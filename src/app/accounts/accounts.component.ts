import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {AccountsService} from "../services/accounts.service";
import {catchError, Observable, throwError} from "rxjs";
import {AccountDetails} from "../model/account.model";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  accountFormGroup! : FormGroup;
  currentPage : number =0;
  pageSize : number =5;
  accountObservable! : Observable<AccountDetails>
  operationFromGroup! : FormGroup;
  errorMessage! :string ;

  constructor(private fb : FormBuilder, private accountService : AccountsService, public authService: AuthService) { }

  ngOnInit(): void {
    this.accountFormGroup=this.fb.group({
      accountId : this.fb.control('')
    });
    this.operationFromGroup=this.fb.group({
      operationType : this.fb.control(null),
      amount : this.fb.control(0),
      description : this.fb.control(null),
      accountDestination : this.fb.control(null)
    })}

  handleSearchAccount() {
    this.errorMessage = "";
    let accountId : string = this.accountFormGroup.value.accountId?.trim() || '';
    if (!accountId || accountId === '') {
      this.errorMessage = "Please enter an account ID";
      return;
    }
    this.accountObservable=this.accountService.getAccount(accountId,this.currentPage, this.pageSize).pipe(
      catchError(err => {
        let errorMsg = "An error occurred while fetching account details";
        if (err.status === 500) {
          errorMsg = "Server error: The account may not exist or there was a server problem. Please check the account ID and try again.";
        } else if (err.status === 404) {
          errorMsg = "Account not found. Please verify the account ID.";
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.message) {
          errorMsg = err.message;
        }
        this.errorMessage = errorMsg;
        console.error("Error fetching account:", err);
        return throwError(() => err);
      })
    );
  }

  gotoPage(page: number) {
    this.currentPage=page;
    this.handleSearchAccount();
  }

  handleAccountOperation() {
    let accountId :string = this.accountFormGroup.value.accountId?.trim() || '';
    if (!accountId || accountId === '') {
      alert("Please search for an account first");
      return;
    }
    let operationType=this.operationFromGroup.value.operationType;
    if (!operationType) {
      alert("Please select an operation type");
      return;
    }
    // Convertir le montant en nombre (car il vient d'un input text)
    let amountValue = this.operationFromGroup.value.amount;
    let amount :number = typeof amountValue === 'string' ? parseFloat(amountValue) : amountValue;
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    let description :string = this.operationFromGroup.value.description?.trim() || '';
    let accountDestination :string = this.operationFromGroup.value.accountDestination?.trim() || '';
    if(operationType=='DEBIT'){
      this.accountService.debit(accountId, amount, description).subscribe({
        next : (data)=>{
          alert("Success Debit");
          this.operationFromGroup.reset();
          this.operationFromGroup.patchValue({ amount: 0 });
          this.handleSearchAccount();
        },
        error : (err)=>{
          console.error("Debit error full details:", err);
          console.error("Error status:", err.status);
          console.error("Error body:", err.error);
          
          let errorMsg = "Debit operation failed";
          if (err.status === 500) {
            // Essayer d'extraire le message d'erreur du backend
            if (err.error) {
              if (typeof err.error === 'string') {
                errorMsg = err.error;
              } else if (err.error.message) {
                errorMsg = err.error.message;
              } else if (err.error.error) {
                errorMsg = err.error.error;
              } else {
                errorMsg = "Server error: The debit operation could not be completed. Please check the account balance and try again.";
              }
            } else {
              errorMsg = "Server error: The debit operation could not be completed. Please check the account balance and try again.";
            }
          } else if (err.status === 400) {
            errorMsg = "Bad request: " + (err.error?.message || "Please check the entered data");
          } else if (err.error?.message) {
            errorMsg = err.error.message;
          } else if (err.message) {
            errorMsg = err.message;
          }
          alert("Error: " + errorMsg);
        }
      });
    } else if(operationType=='CREDIT'){
      this.accountService.credit(accountId, amount, description).subscribe({
        next : (data)=>{
          alert("Success Credit");
          this.operationFromGroup.reset();
          this.operationFromGroup.patchValue({ amount: 0 });
          this.handleSearchAccount();
        },
        error : (err)=>{
          console.error("Credit error full details:", err);
          console.error("Error status:", err.status);
          console.error("Error body:", err.error);
          
          let errorMsg = "Credit operation failed";
          if (err.status === 500) {
            if (err.error) {
              if (typeof err.error === 'string') {
                errorMsg = err.error;
              } else if (err.error.message) {
                errorMsg = err.error.message;
              } else if (err.error.error) {
                errorMsg = err.error.error;
              } else {
                errorMsg = "Server error: The credit operation could not be completed. Please try again.";
              }
            } else {
              errorMsg = "Server error: The credit operation could not be completed. Please try again.";
            }
          } else if (err.status === 400) {
            errorMsg = "Bad request: " + (err.error?.message || "Please check the entered data");
          } else if (err.error?.message) {
            errorMsg = err.error.message;
          } else if (err.message) {
            errorMsg = err.message;
          }
          alert("Error: " + errorMsg);
        }
      });
    }
    else if(operationType=='TRANSFER'){
      if (!accountDestination || accountDestination === '') {
        alert("Please enter a destination account for transfer");
        return;
      }
      this.accountService.transfer(accountId, accountDestination, amount, description).subscribe({
        next : (data)=>{
          alert("Success Transfer");
          this.operationFromGroup.reset();
          this.operationFromGroup.patchValue({ amount: 0 });
          this.handleSearchAccount();
        },
        error : (err)=>{
          console.error("Transfer error full details:", err);
          console.error("Error status:", err.status);
          console.error("Error body:", err.error);
          
          let errorMsg = "Transfer operation failed";
          if (err.status === 500) {
            if (err.error) {
              if (typeof err.error === 'string') {
                errorMsg = err.error;
              } else if (err.error.message) {
                errorMsg = err.error.message;
              } else if (err.error.error) {
                errorMsg = err.error.error;
              } else {
                errorMsg = "Server error: The transfer operation could not be completed. Please check the accounts and balance, then try again.";
              }
            } else {
              errorMsg = "Server error: The transfer operation could not be completed. Please check the accounts and balance, then try again.";
            }
          } else if (err.status === 400) {
            errorMsg = "Bad request: " + (err.error?.message || "Please check the entered data");
          } else if (err.error?.message) {
            errorMsg = err.error.message;
          } else if (err.message) {
            errorMsg = err.message;
          }
          alert("Error: " + errorMsg);
        }
      });

    }
  }
}
