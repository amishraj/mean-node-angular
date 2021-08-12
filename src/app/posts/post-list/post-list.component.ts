import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { Post } from "../post.model";
import { PostsService } from "../posts.service";

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html",
  styleUrls: ["./post-list.component.css"]
})

export class PostListComponent implements OnInit, OnDestroy{
  isloading=false;
//  @Input() posts: Post[] =[];
totalPosts= 0;
postsPerPage= 5;
pageSizeOptions=[1,2,5,10]
currentPage=1;

private authStatusSubs: Subscription;
public userIsAuthenticated;

userId:string;

posts: Post[] =[];
  postsSub: Subscription = new Subscription;

  constructor(public postsService: PostsService, private authService: AuthService){
  }
  ngOnDestroy(){
    this.postsSub.unsubscribe();
    this.authStatusSubs.unsubscribe();
  }

  onDelete(postId: string){
    this.isloading=true;

    this.postsService.deletePost(postId).subscribe(()=>{
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }, ()=>{
      this.isloading=false;

    });
  }

  onChangedPage(pageData: PageEvent){
   this.isloading=true;
    //console.log(this.isloading + "loading")
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnInit() {
    this.isloading=true;

    this.postsService.getPosts(this.postsPerPage, this.currentPage);

    this.userId= this.authService.getUserId();
    this.postsSub= this.postsService.getPostUpdateListener()
      .subscribe((postData: {posts: Post[], postCount:number})=> {
        this.posts= postData.posts;

        this.totalPosts = postData.postCount;
        this.isloading=false;

      });

      this.userIsAuthenticated = this.authService.getIsAuth();

     this.authStatusSubs= this.authService
     .getAuthStatusListener()
     .subscribe(isAuthenticated =>{
      this.userIsAuthenticated = isAuthenticated;
      this.userId= this.authService.getUserId();

     });
  }
}
