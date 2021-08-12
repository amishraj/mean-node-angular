const Post = require ('../models/post');

exports.createPost =   (req, res, next)=>{
  const url = req.protocol + "://" + req.get("host");
  const post= new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });

 // console.log(post);

  post.save()
  .then(createdPost=> {
    res.status(201).json({
      message: 'post added successfully',
      post: {
        // id: createdPost._id,
        // title: createdPost.title,
        // content: createdPost.content,
        // imagePath: createdPost.imagePath

        //alternative
        ...createdPost,
        id: createdPost._id
      }
    });
  })
  .catch(error =>{
    res.status(500).json({message:'Creating a Post Failed!'});
  });
}

exports.updatePost = (req, res, next)=>{
  let imagePath= req.body.imagePath;
  if(req.file){
    const url = req.protocol + "://" + req.get("host");
    imagePath= url + "/images/" + req.file.filename
  }

  const post= new Post({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator:  req.userData.userId
  }

  );
  //console.log(post)
  Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post)
  .then(result => {
   // console.log(result)
    if(result.n > 0){
      res.status(200).json({
        message: 'update successful'
      });
    } else{
      res.status(401 ).json({
        message: 'not authorized'
      });
    }

  })
  .catch(error=>{
    res.status(500)
    .json(
      {
        message:"Couldn't update post!"
      });
  });
}

exports.getPosts = (req, res, next)=>{
  //console.log(req.query)

  const pageSize =  +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery= Post.find();

  let fetchedPosts;

  if(pageSize && currentPage){
    postQuery
      .skip(pageSize * (currentPage -1))
      .limit(pageSize)
  }

  postQuery
    .then(documents => {
        fetchedPosts = documents;
        return Post.countDocuments();
    })
    .then(count => {
       res.status(200).json({
        message: 'posts fetched successfully',
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(error=>{
      res.status(500).json({
        message:'Fetching Posts Failed!'
      });
    });
}

exports.getPost = (req, res, next)=>{
  Post.findById(req.params.id).then(post =>{
    if(post){
      res.status(200).json(post);
    }
    else{
      res.status(404).json({message: 'post not found'});
    }
  })
  .catch(error=>{
    res.status(500).json({
      message:'Fetching Posts Failed!'
    });
  })
}

exports.deletePost= (req, res, next)=>{
  //console.log(req.params.id);

  Post.deleteOne({_id:req.params.id, creator: req.userData.userId})
    .then(result=>{
      console.log(result)
    if(result.n > 0){
      res.status(200).json({
        message: 'deletion successful'
      });
    } else{
      res.status(401 ).json({
        message: 'not authorized'
      });
    }
    })
    .catch(error=>{
      res.status(500).json({
        message:'Fetching Posts Failed!'
      });
    });
}




