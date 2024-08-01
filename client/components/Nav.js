import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context";
import Link from "next/link";
import { useRouter } from "next/router";
import { Avatar } from "antd";
import styles from "/components/Nav.module.css"
import { ThemeContext } from "../context/themeContext";
import ToggleButton from "./cards/ToggleButton";

const Nav = () => {
  const [current, setCurrent] = useState(""); // to store the path name for active links
  const [state, setState] = useContext(UserContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    process.browser && setCurrent(window.location.pathname);
  }, [process.browser && window.location.pathname]);

  const router = useRouter();

  const logout = () => {
    window.localStorage.removeItem("auth");
    setState(null);
    router.push("/login");
  };


  return (
    <>

    <nav className={`${theme==="dark" ? styles.navDark : styles.nav}`}>
      <div className={`${theme==="dark" ? styles.navLinkDark : styles.navLink}`}>
        SocialGenZ

      {state !== null ? (
        <>
          <div className={`${styles.dropdown}`}>
            <button
              className={`${styles.btn}`}
              type="button"
              id="dropdownMenuButton1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {state && state.user && <img className={`${styles.profileImg}`} src="https://avatar.iran.liara.run/public" />}
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              <li className={`${styles.dropdownList}`}>
                <Link
                  href="/user/dashboard"
                  className={`nav-link dropdown-item ${
                    current === "/user/dashboard" && "active"
                  }`}
                >
                  Dashboard
                </Link>
              </li>
              <li className={`${styles.dropdownList}`}>
                <Link
                  href="/user/profile/update"
                  className={`nav-link dropdown-item ${
                    current === "/user/profile/update" && "active"
                  }`}
                >
                 Edit Profile
                </Link>
              </li>
              <li className={`${styles.dropdownList}`}>
                <a
                  onClick={logout}
                  className={`nav-link dropdown-item `}
                  style={{ cursor: "pointer" }}
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </>
      ) : (
        <>
          <Link href="/login" className="nav-link">
            Login
          </Link>
          <Link href="/register" className="nav-link">
            Register
          </Link>
        </>
      )}
      </div>

    </nav>
    <ToggleButton toggleTheme={toggleTheme} theme={theme} />
    </>
  );
};

export default Nav;
