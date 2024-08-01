import { UserProvider } from "../context";
import "bootstrap/dist/css/bootstrap.min.css";
import Nav from "../components/Nav";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "antd/dist/reset.css";
import { ThemeProvider } from "../context/themeContext";
import './globals.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <Nav />
        <ToastContainer position="top-center" />
        <Component {...pageProps} />
      </UserProvider>
    </ThemeProvider>
  );
}
