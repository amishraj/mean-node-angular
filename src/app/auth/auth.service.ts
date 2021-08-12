import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { AuthData } from "./auth-data.model";

import { environment } from "src/environments/environment";

const BACKEND_URL = environment.apiUrl + "/user/"

@Injectable({
  providedIn:'root'
})
export class AuthService{
  private isAuthenticated = false;
  private token: string;
  private authStatusListener= new Subject<boolean>();
  private tokenTimer: any;

  private userId: string;

  constructor(private http: HttpClient, private router: Router){
  }

  getToken(){
    return this.token;
  }

  getIsAuth(){
    return this.isAuthenticated;
  }

  getUserId(){
    return this.userId;
  }

  getAuthStatusListener(){
    return this.authStatusListener.asObservable();
  }

  createUser(email:string, password:string){

    const authData: AuthData= {email:email, password:password};
    return this.http.post(BACKEND_URL + "/signup/", authData)
    .subscribe(response =>{
      // console.log("response");
       this.router.navigate(['/login']);
     }, error =>{
       //console.log(error);
      this.authStatusListener.next(false);
     });
  }

  login(email:string, password:string){
    const authData: AuthData= {email:email, password:password};

    this.http.post<{token:string, expiresIn:number, userId:string}>(BACKEND_URL + "/login", authData)
      .subscribe(response=>{
        //console.log(response);
        const token = response.token;
        this.token = token;
        if(token){
          const expiresInDuration = response.expiresIn;
          //console.log(expiresInDuration);
          this.setAuthTimer(expiresInDuration)
          this.isAuthenticated=true;

          this.userId = response.userId;
          this.authStatusListener.next(true);
          const now= new Date();
          const expirationDate= new Date(now.getTime() + expiresInDuration * 1000);
          //console.log(expirationDate);
          this.saveAuthData(token, expirationDate, this.userId)

          this.router.navigate(['/']);
        }
      }, error =>{
        this.authStatusListener.next(false);
      })
  }

  autoAuthUser(){
    const authInformation= this.getAuthData();

    if(authInformation){
      const now = new Date();
      const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

      if(expiresIn>0){
        this.token= authInformation.token;
        this.isAuthenticated=true;
        this.userId= authInformation.userId;
        this.setAuthTimer(expiresIn/1000)
        this.authStatusListener.next(true);
      }
    }
    else{
      return;
    }
  }

  logout(){
    this.token=null;
    this.isAuthenticated=false;
    this.authStatusListener.next(false);
    this.userId=null;

    this.clearAuthData();

    this.router.navigate(['/']);
    clearTimeout(this.tokenTimer);
  }

  private setAuthTimer(duration:number){
   // console.log("Setting Timer: " + duration);
    this.tokenTimer= setTimeout(()=>{
      this.logout();
    }, duration * 1000)
  }

  private saveAuthData(token: string, expirationDate: Date, userId:string){
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData(){
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId')
  }

  private getAuthData(){
    const token= localStorage.getItem('token');
    const expirationDate= localStorage.getItem('expiration');
    const userId= localStorage.getItem('userId');

    if((token && expirationDate)){
      return{
        token:token,
        expirationDate: new Date(expirationDate),
        userId:userId
      }
    }
    else{
      return null;
    }

  }
}
