import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../auth.service";

@Component({
  templateUrl:'./signup.component.html',
  styleUrls: ['./signup.component.css']
})

export class SignupComponent implements OnInit, OnDestroy{

  private authStatusSub: Subscription;

  constructor(public authService: AuthService, private router: Router){}

  ngOnInit(): void {
   this.authStatusSub= this.authService.getAuthStatusListener().subscribe(
     authStatus =>{
      this.isLoading=false;
   });
  }

  isLoading= false;

  onSignup(form:NgForm){
    //console.log(form.value)
    if(form.invalid){
      return;
    } else{
      this.isLoading=true;
      this.authService.createUser(form.value.email, form.value.password);
    }
  }

  ngOnDestroy(): void {
      this.authStatusSub.unsubscribe();
  }

}
