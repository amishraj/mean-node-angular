import { OnDestroy, OnInit, Output } from "@angular/core";
import { Component, EventEmitter } from "@angular/core";
import { FormControl, FormGroup, FormsModule, NgForm, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { Post } from "../post.model";
import { PostsService } from "../posts.service";

import { mimeType } from "./mime-type.validator";

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})

export class PostCreateComponent implements OnInit, OnDestroy{
  enteredContent=''
  enteredTitle=''

  form !:FormGroup;
  imagePreview?: string;

  isloading=false;

  private mode = 'create';
  private postId:any;
   post!: Post;

   private authStatusSub: Subscription;

 // @Output() postCreated = new EventEmitter <Post>();

  constructor(public postsService: PostsService, public route: ActivatedRoute, private authService: AuthService){
  }


  ngOnInit() {
    this.authStatusSub= this.authService.getAuthStatusListener().subscribe(
      authStatus=>{
        this.isloading=false;
      }
    );

    this.form= new FormGroup({
      'title': new FormControl(null,
        {validators: [Validators.required, Validators.minLength(3)]
      }),
      'content': new FormControl(null,
        {
          validators: [Validators.required]
        }),

        'image': new FormControl(null,
          {
            validators: [Validators.required],
            asyncValidators: [mimeType]
          })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap)=>{
      if(paramMap.has('postId')){
        this.mode='edit'
        this.postId= paramMap.get('postId');

        this.isloading=true;

        this.postsService.getPost(this.postId).subscribe(postData =>{
          this.isloading=false;

          this.post= {title:postData.title, content: postData.content, id:postData._id, imagePath:postData.imagePath, creator:postData.creator}

          //console.log(JSON.stringify(this.post))
          this.form.setValue({
           'title':this.post.title,
           'content': this.post.content,
           'image': this.post.imagePath
          });

          this.imagePreview= this.post.imagePath
        });
       // console.log(this.post);

      }

      else{
        this.mode='create'
        this.postId=null;
      }
    });
    }

  onImagePicked(event:Event){
    const file = (event.target as HTMLInputElement).files![0];
    this.form.patchValue({image: file});

    this.form.get('image')?.updateValueAndValidity();

    // console.log(file);
    // console.log(this.form)

    const reader = new FileReader();
    reader.onload = () =>{
      this.imagePreview = reader.result as string
    };
    reader.readAsDataURL(file);
  }

  onSavePost(){
    if(this.form.invalid){ return; }
    const post: Post= {id: 'null', title: this.form.value.title, content: this.form.value.content, imagePath:this.form.value.image, creator:null};
   // this.postCreated.emit(post)
   this.isloading=true;

    if(this.mode == 'create'){
      this.postsService.addPosts(post, this.form.value.image)

  }
    else{
      this.postsService.updatePost(this.postId, post)
    }

    this.form.reset();
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

}
