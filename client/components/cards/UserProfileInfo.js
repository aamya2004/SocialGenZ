import { useContext, useEffect } from "react";
import { UserContext } from "../../context";
import axios from "axios";
import styles from "/components/cards/UserProfileInfo.module.css"
import { ThemeContext } from "../../context/themeContext";
const UserProfileInfo = () => {
  const [state, setState] = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      try {
        const { data } = await axios.get("/current-user");
        setState((prevState) => ({
          ...prevState,
          user: data,
        }));
      } catch (error) {
        console.error("Error fetching user profile", error);
      }
    };

    if (!state.user) {
      fetchCurrentUserProfile();
    }
  }, [state.user, setState]);

  return (
    <>

      {state.user ? (
        <>

        <div className={`${theme === "light" ? styles.infoContainer : styles.infoContainerDark}`}>
        <div className={`${theme === "light" ? styles.headerInfo : styles.headerInfoDark}`}>
          <h2>{state.user.name}</h2>
          <h6>@{state.user.username}</h6>
        </div>

          <p className={`${theme==="light" ? styles.about : styles.aboutDark}`}>{state.user.about}</p>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

export default UserProfileInfo;
