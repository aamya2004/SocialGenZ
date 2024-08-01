import renderHTML from "react-render-html"; // to render html from react-quill editor
import moment from "moment";
import { useRouter } from "next/router";
import { Avatar } from "antd";
import styles from "/components/cards/PostList.module.css";
import { FaRegComment } from "react-icons/fa";
import { GoHeart, GoHeartFill } from "react-icons/go";
// import { imageSource } from "../../functions"; // this is for profile photo show
import {
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
//context
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context";
import { ThemeContext } from "../../context/themeContext";

const PostList = ({
  posts,
  handleDelete,
  handleLike,
  handleUnlike,
  handleAddComment,
}) => {
  const [state, setState] = useContext(UserContext);
  const { theme} = useContext(ThemeContext);
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [comment, setComment] = useState("");
  const router = useRouter();

  useEffect(() => {
    console.log("PostList => ", posts);
    console.log(state.user);
  }, [posts, state.user]);

  const handleCommentClick = (postId) => {
    setOpenCommentPostId(openCommentPostId === postId ? null : postId);
  };

  return (
    <>
      {posts &&
        posts.map((post) => (
          <>
            <hr className={`${styles.sepLine}`}></hr>
            <div key={post.id} className={`${styles.card}`}>
              <div className={`${styles.cardHeaderAvatar}`}>
                <Avatar size={40}>{post.name[0]} </Avatar>
              </div>
              <div className={`${styles.cardHeader}`}>
                {/* Profile Avatar */}
                {/* <Avatar size={40} src={post.image_url} /> */}
                <div className={`${styles.headerInfo}`}>
                  <span className="">{post.name}</span>
                  <span className={`${styles.datePosted}`}>
                    {moment(post.createdAt).fromNow()}
                  </span>
                </div>
                <div className={`${styles.postContent}`}>
                  <div>{renderHTML(post.content)}</div>
                </div>
                <div className="card-footer">
                  {post.image && (
                    <div
                      style={{
                        backgroundImage: "url(" + post.image_url + ")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center ceter",
                        backgroundSize: "cover",
                        height: "300px",
                      }}
                    ></div>
                  )}
                  {/* like and comment section */}
                  <div className={`${styles.likeCommentSec}`}>
                    <div className={`${styles.likeSec}`}>
                      {post.likes &&
                      Array.isArray(post.likes) &&
                      state.user &&
                      state.user.id &&
                      post.likes.includes(state.user.id) ? (
                        <GoHeartFill
                          className={`${styles.liked}`}
                          onClick={() => handleUnlike(post.id)}
                        />
                      ) : (
                        <GoHeart
                          className={`${styles.notLiked}`}
                          onClick={() => handleLike(post.id)}
                        />
                      )}
                      <div className="">{
                        post.likes ? post.likes.length : 0} </div>
                    </div>
                    <div className={`${styles.commentSec}`}>
                      <FaRegComment
                        onClick={() => handleCommentClick(post.id)}
                      />
                      {post.comments ? (
                        <div className="">{post.comments.length}</div>
                      ) : (
                        <div className="">0</div>
                      )}
                    </div>

                    {state && state.user && state.user.id === post.user_id && (
                      <>
                        {/* <EditOutlined
                        onClick={() => router.push(`/user/post/${post.id}`)}
                        className="text-danger pt-2 h5 px-2 mx-auto"
                      /> */}

                        {/* to be added later */}
                        {/* <DeleteOutlined
                        onClick={() => handleDelete(post)}
                        className="text-danger pt-2 h5 px-2"
                      /> */}
                      </>
                    )}
                  </div>
                  {post.comments &&
                    openCommentPostId === post.id &&
                    post.comments.length > 0 &&
                    post.comments.map((comment) => {
                      return (
                        <div key={comment.id} className={`${styles.comments}`}>
                          <div className={`${styles.commenterImg}`}>
                            <Avatar size={30}>{comment.name[0]} </Avatar>
                          </div>
                          <div className={`${styles.commenterInfo}`}>
                            <div className={`${styles.commenterHeader}`}>
                              <span>{comment.name}</span>
                              <span className="">
                                {moment(comment.created).fromNow()}
                              </span>
                            </div>
                            <span className="">{comment.text}</span>
                          </div>
                        </div>
                      );
                    })}
                    {openCommentPostId === post.id && (
                      <div className={`${styles.addComment}`}>
                        <input
                          type="text"
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add a comment"
                          className={`${styles.addCommentInput}`}
                        />
                        <button
                          className={`${styles.addCommentButton}`}
                          onClick={() => handleAddComment(post.id, comment)}
                        >
                          Post
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </>
        ))}
    </>
  );
};

export default PostList;
