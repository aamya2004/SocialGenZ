import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Modal, Avatar } from "antd";
import Link from "next/link";
import AuthForm from "../../../components/forms/AuthForm";
import { useRouter } from "next/router";
import { UserContext } from "../../../context";
import { LoadingOutlined, CameraOutlined } from "@ant-design/icons";

const ProfileUpdate = () => {
  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useContext(UserContext); // Context state
  //profile image
  const [image, setImage] = useState({});
  const [uploading, setUploading] = useState(false);

  const router = useRouter();

  // store the value of user using context
  useEffect(() => {
    if (state && state.user) {
      // console.log(state.user);
      setUsername(state.user.username);
      setAbout(state.user.about);
      setName(state.user.name);
      setEmail(state.user.email);
      setImage(state.user.image);
    }
  }, [state && state.user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // console.log(name, email, password, secret);
      setLoading(true);
      const { data } = await axios.put(`/profile-update`, {
        username,
        about,
        name,
        email,
        password,
        secret,
        image,
      });
      console.log(data);
      if (data.error) {
        toast.error(data.error);
        setLoading(false);
      } else {
        // update local storage, update user, keep token
        let auth = JSON.parse(localStorage.getItem("auth"));
        auth.user = data;
        localStorage.setItem("auth", JSON.stringify(auth));
        //update contex
        setState({ ...state, user: data });
        setOk(true);
        setLoading(false);
      }
    } catch (err) {
      toast.error(err.response.data);
      setLoading(false);
    }
  };

  // function to update profile page
  const handleImage = async (e) =>{
    const file = e.target.files[0]; // it could be the array
    let formData = new FormData();
    formData.append('image', file);
    // console.log([...formData]);
    
    setUploading(true);
    try {
      const {data} = await axios.post('/upload-image', formData);
      console.log(data);
      {data && setImage({
        url: data.url,
        public_id: data.public_id
      })
      setUploading(false);
    }
    } catch (error) {
      console.log("Error while upload image => ",error);
      setUploading(false)
    }
  };

  return (
    <div className="container-fluid">
      <div className="row py-5 text-light bg-default-image">
        <div className="col text-center">
          <h1>Profile</h1>
        </div>
      </div>

      <div className="row py-5">
        <div className="col-md-6 offset-md-3">
          {/* UPload image start */}
          <label className="d-flex justify-content-center h5">
            {image && image.url ? (
              <Avatar size={30} src={image.url} className="mt-1" />
            ) : uploading ? (
              <LoadingOutlined className="mt-2" />
            ) : (
              <CameraOutlined className="mt-2" />
            )}

            <input
              onChange={handleImage}
              type="file"
              accept="images/*"
              hidden
            />
          </label>
          {/* UPload image end */}

          {/* FORM */}
          <AuthForm
            profileUpdate={true}
            handleSubmit={handleSubmit}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            loading={loading}
            username={username}
            setUsername={setUsername}
            about={about}
            setAbout={setAbout}
          />
        </div>
      </div>

      <div className="row">
        <div className="col">
          <Modal
            title="Congratulations!"
            open={ok}
            onCancel={() => setOk(false)}
            footer={null}
          >
            <p>You have successfully update your profile.</p>
          </Modal>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <p className="text-center">
            Already registered? <Link href="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdate;
