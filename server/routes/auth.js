import express from "express";
import {
  currentUser,
  forgotPassword,
  login,
  register,
  profileUpdate,
  findPeople,
  addFollower,
  userFollow,
  userFollowing,
  getFollowersCount,
  removeFollower,
  userUnfollow,
} from "../controllers/auth.js";
// middleware

import { requireSignIn, canEditDeletePost } from "../middlewares/index.js";
import {
  createPost,
  uploadImage,
  postByUser,
  userPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
} from "./../controllers/post.js";

const router = express.Router();

router.get('/', (req,res) => {
  res.send('Hello from  route');
})

router.post("/register", register);
router.post("/login", login);
router.get("/current-user", requireSignIn, currentUser); // this is to check is user authorised to access the protected page,
router.post("/forgot-password", forgotPassword);

//to update user
router.put("/profile-update", requireSignIn, profileUpdate);
router.get("/find-people", requireSignIn, findPeople); // for find people to follow
// to follow
router.put("/user-follow", requireSignIn, addFollower, userFollow); //(addFollower is middleware but still it is in the controller)

//following page
router.get("/user-following", requireSignIn, userFollowing);
router.get("/user-followers-count", requireSignIn, getFollowersCount);
//unfollow
router.put("/user-unfollow",requireSignIn,removeFollower, userUnfollow);


router.post("/create-post", requireSignIn, createPost);
router.post(
  "/upload-image",
  requireSignIn,
  // formidable({ maxFileSize: 5 * 1024 * 1024 }),
  uploadImage
);
router.post("/add-comment", requireSignIn, addComment);
//posts-rendring
router.get("/user-posts", requireSignIn, postByUser);
router.get("/user-post/:_id", requireSignIn, userPost); // edit post
//update post
router.put("/update-post/:_id", requireSignIn, canEditDeletePost, updatePost);
//delete post
router.delete(
  "/delete-post/:_id",
  requireSignIn,
  canEditDeletePost,
  deletePost
);
//like and unlike post
router.put("/like-post", requireSignIn, likePost);
router.put("/unlike-post", requireSignIn, unlikePost);


export default router;