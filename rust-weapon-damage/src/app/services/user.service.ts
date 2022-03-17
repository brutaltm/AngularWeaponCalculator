import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from 'angularx-social-login';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  rootUrl = '/api';
  user: SocialUser = new SocialUser();
  loggedIn: boolean = false;

  constructor(private http: HttpClient, private authService: SocialAuthService) {
    this.verifyIfLoggedIn();
    this.authService.authState.subscribe(user => {
      //console.log(user.authToken);
      this.user = user;
      this.loggedIn = user != null;
      if (this.loggedIn) {
        this.verifyToken();
      }
    });
    
  }

  verifyIfLoggedIn() {
    this.http.get<any>(this.rootUrl+"/verifyIfLoggedIn").subscribe(resp => {
      var user = this.user as any;
      if(resp.id) {
        for(const prop in resp) {
          user[prop] = resp[prop];
        }
        this.loggedIn = true;
        //console.log(user);
      }
    })
  }

  verifyToken() {
    this.http.post<any>(this.rootUrl+"/verifyToken",{ token: this.user.idToken }).subscribe(resp => {
      // var user = this.user as any;
      // console.log(resp);
      // if (resp.id)
      //   this.loggedIn = true;
      // for(const prop in resp)
      //   user[prop] = resp[prop];
      //console.log(resp);
    })
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signOut(): void {
    if (this.user.idToken)
      this.authService.signOut();
    else {
      this.user = new SocialUser();
      this.loggedIn = false;
    }
    this.http.get(this.rootUrl+"/logout").subscribe(resp => { });
  }

  refreshToken(): void {
    this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
}