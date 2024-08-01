import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../context";
import CreatePostForm from "../../components/forms/CreatePostForm";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import PostList from "../../components/cards/PostList";
import People from "../../components/cards/people";
import Link from "next/link";
import styles from "/pages/user/dashboard.module.css";
import { ThemeContext } from "../../context/themeContext";
import Trending from "../../components/cards/Trending";
import UserProfileInfo from "../../components/cards/UserProfileInfo";

const Dashboard = () => {
  const [followingList, setFollowingList] = useState([]);
  const [followersCount, setFollowersCount] = useState([]);
  const [state, setState] = useContext(UserContext);
  const [content, setContent] = useState("");
  const [image, setImage] = useState({});
  const [uploading, setUploading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [people, setPeople] = useState([]);
  const { theme } = useContext(ThemeContext);

  const router = useRouter();

  useEffect(() => {
    if (state && state.token) {
      fetchUserPost();
      findPeople();
    }
    console.log(people);
  }, [state?.token]);

  useEffect(() => {
    console.log("Posts state updated:", posts);
    console.log("People ", people);
    console.log("Following List: ", followingList);
    console.log("Followers Count: ", followersCount);
  }, [posts]);

  const fetchUserPost = async () => {
    try {
      const { data } = await axios.get("/user-posts");
      console.log("Fetched posts data:", data);
      setPosts(data);
    } catch (error) {
      console.log("ERROR while post-fetching Client => ", error);
    }
  };

  const findPeople = async () => {
    try {
      const { data } = await axios.get("/find-people");
      console.log("Fetched people:", data);
      setPeople(data);
    } catch (error) {
      console.log("Error while findPeople Client =>", error);
    }
  };

  const postSubmit = async (e) => {
    e.preventDefault();
    console.log("Post=> ,", content);

    try {
      const { data } = await axios.post("/create-post", { content, image });
      console.log("Create post response => ", data);
      if (data.error) {
        toast.error(data.error);
      } else {
        fetchUserPost();
        toast.success("Post created");
        setContent("");
        setImage({});
      }
    } catch (error) {
      console.log("Error from dashboard =>", error);
    }
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    let formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const { data } = await axios.post("/upload-image", formData);
      console.log("Image upload response:", data);
      setImage({
        url: data.url,
        public_id: data.public_id,
      });
      setUploading(false);
    } catch (error) {
      console.log("Error while uploading image => ", error);
      setUploading(false);
    }
  };

  const handleDelete = async (post) => {
    try {
      const answer = window.confirm("Are you sure?");
      if (!answer) return;
      await axios.delete(`/delete-post/${post.id}`);
      toast.error("Post Deleted");
      fetchUserPost();
    } catch (error) {
      console.log("Error while deleting post => ", error);
    }
  };

  const handleFollow = async (user) => {
    try {
      const { data } = await axios.put("/user-follow", { _id: user.id });
      let auth = JSON.parse(localStorage.getItem("auth"));
      auth.user = data;
      // localStorage.setItem('auth', JSON.stringify(auth));

      // setState({ ...state, user: data });

      let filtered = people.filter((p) => p.id !== user.id);
      console.log(filtered);
      toast.success(`Following ${user.name}`);

      const followingResponse = await axios.get("/user-following");
      setFollowingList(followingResponse.data);

      // Fetch followers count
      const followersCountResponse = await axios.get("/user-followers-count");
      setFollowersCount(followersCountResponse.data);

      fetchUserPost();
    } catch (error) {
      console.log("Error while handleFollow in dashboard.js =>", error);
    }
  };

  const handleLike = async (id) => {
    try {
      const { data } = await axios.put("/like-post", { _id: id });
      console.log(data);
      fetchUserPost();
    } catch (error) {
      console.log("Error while handling like =>", error);
    }
  };

  const handleUnlike = async (_id) => {
    try {
      const { data } = await axios.put("/unlike-post", { _id });
      fetchUserPost();
    } catch (error) {
      console.log("Error while handling unlike =>", error);
    }
  };

  const handleAddComment = async (postId, comment) => {
    console.log(`Adding comment`);
    console.log("Comment:", comment);
    console.log("postId:", postId);
    try {
      const { data } = await axios.post("/add-comment", {
        _id: postId,
        comment: comment,
      });
      console.log(data);
      fetchUserPost();
    } catch (error) {
      console.log("Error while adding comment =>", error);
    }
  };

  return (
    <div className={`${styles.dashPage}`}>
    <div className={`${styles.userSec}`}>
      <UserProfileInfo />
      <People people={people} handleFollow={handleFollow} />
    </div>

      <div className={`${styles.postArea}`}>
        <div className={`${styles.posts}`}>
          <CreatePostForm
            content={content}
            setContent={setContent}
            postSubmit={postSubmit}
            handleImage={handleImage}
            uploading={uploading}
            image={image}
          />
          <br />
          <h4
            className={`${
              theme === "dark" ? styles.headingDark : styles.heading
            }`}
          >
            New from your friends
          </h4>
          <PostList
            posts={posts}
            handleDelete={handleDelete}
            handleLike={handleLike}
            handleUnlike={handleUnlike}
            handleAddComment={handleAddComment}
          />
        </div>

        <div className="col-md-4">
          {state?.user?.following && (
            <Link href={`/user/following`} className="h6 text-decoration-none">
              {state.user.following.length} Following
            </Link>
          )}
        </div>
      </div>
      <Trending />
    </div>
  );
};

export default Dashboard;
