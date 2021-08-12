import { Injectable } from "@angular/core";
import { Post } from "./post.model";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import {map} from 'rxjs/operators';
import { Router } from "@angular/router";

import { environment } from "src/environments/environment";

const BACKEND_URL = environment.apiUrl + "/posts/"

@Injectable({providedIn:'root'})
export class PostsService {
  private posts : Post[]=[];
  private postsUpdated = new Subject<{posts:Post[], postCount:number}>();

  constructor(private http: HttpClient, private router: Router){}

  getPosts(postsPerPage:number, currentPage:number){
    const queryParams=`?pagesize=${postsPerPage}&page=${currentPage}`;
    //return [...this.posts];
    this.http
    .get<{message: string, posts: any, maxPosts:number}>(
      BACKEND_URL + queryParams
      )
      .pipe(map((postData)=>{
        return {posts: postData.posts.map(post => {
          return{
            id : <string> post._id,
            title:post.title,
            content:post.content,
            imagePath: post.imagePath,
            creator: post.creator
          }
        }), maxPosts: postData.maxPosts};
      }))
      .subscribe((transformedPostData)=>{
        //console.log(transformedPostData);
        this.posts= transformedPostData.posts;
        this.postsUpdated.next(
          {
            posts:[...this.posts],
            postCount: transformedPostData.maxPosts
          });
    });
  }

  getPostUpdateListener(){
    return this.postsUpdated.asObservable();
  }

  getPost(id:string){
    //console.log(JSON.stringify(this.posts.find(p => p.id === id )))
    //return {...this.posts.find(p => p.id === id )};

    return this.http.get<{_id:string, title:string, content:string, imagePath:string, creator:string}>
    (BACKEND_URL + id);
  }

  addPosts(post: Post, image: File){
    const postData = new FormData();

    postData.append("title", post.title);
    postData.append("content", post.content);
    postData.append("image", image, post.title);

    this.http.post<{message:string, post:Post}>(BACKEND_URL, postData)
    .subscribe((responseData)=>{
     // console.log(responseData.message);
      this.router.navigate(['/']);
    });

  }

  updatePost(id:string, postData:Post){
   // const post: Post= postData;
    let newPostData: Post | FormData;
    if(typeof(postData.imagePath)=='object'){
       newPostData = new FormData();
       newPostData.append("id", id);
      newPostData.append("title", postData.title);
      newPostData.append("content", postData.content)
      newPostData.append("image", postData.imagePath, postData.title)
    } else {
       newPostData = {
        id: id,
        title: postData.title,
        content: postData.content,
        imagePath: postData.imagePath,
        creator:null
      };

    }

    this.http
    .put(BACKEND_URL + id, newPostData)
    .subscribe(response => {
     this.router.navigate(['/']);

    });

  }

  deletePost(postId: string){
    return this.http.delete(BACKEND_URL+  postId);
  }
}
