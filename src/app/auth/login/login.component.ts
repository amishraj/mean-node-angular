import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../auth.service";

@Component({
  templateUrl:'./login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy{
  private authStatusSub: Subscription;

  constructor(public authService: AuthService, private router: Router){}

  ngOnInit(): void {
   this.authStatusSub= this.authService.getAuthStatusListener().subscribe(
     authStatus =>{
      this.isLoading=false;
   });
  }

  isLoading= false;

  onLogin(form:NgForm){
   // console.log(form.value)

    if(form.invalid){
      return;
    }
    this.isLoading=true;
    this.authService.login(form.value.email, form.value.password);
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();

  }

}
