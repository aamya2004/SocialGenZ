import { Avatar } from "antd";
import { CameraOutlined, LoadingOutlined } from '@ant-design/icons';
import styles from "/components/forms/CreatePost.module.css"
import { useContext } from "react";
import { ThemeContext } from "../../context/themeContext";

const CreatePostForm = ({ content, setContent, postSubmit, handleImage, uploading, image }) => {
  const { theme} = useContext(ThemeContext);

  return (
    <div className={`${theme==="dark" ? styles.darkCard : styles.card}`}>
      <div className={`${styles.cardBody}`}>
        <img className={`${styles.profileImg}`} src="https://avatar.iran.liara.run/public" />
        <form className={`${styles.postingForm}`}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`${styles.postTextArea}`}
            placeholder="What's happening in your life bro!"
            rows="5"
          />
        </form>
      </div>
      <div className={`${styles.attachmentDiv}`}>
        {/* image uploading */}
        <label>
          {image && image.url ? (
            <Avatar size={30} src={image.url} className="mt-1" />
          ) : uploading ? (
            <LoadingOutlined className="mt-2" />
          ) : (
            <CameraOutlined className="mt-2" />
          )}
          <input onChange={handleImage} type="file" accept="image/*" hidden />
        </label>
        <button onClick={postSubmit} className={`${theme==="dark" ?  styles.postButtonDark : styles.postButton}`}>
          Post
        </button>
      </div>
    </div>
  );
};

export default CreatePostForm;
