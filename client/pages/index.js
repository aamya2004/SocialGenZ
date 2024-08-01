import { useContext } from "react";
import { UserContext } from "../context";
import Login from "./login";
import Dashboard from "./user/dashboard";

const Home = () =>{

    const [state, setState] = useContext(UserContext);

    return(
        <>

                    {/* {JSON.stringify(state)} */}
                    {/* <h1 className="display-1 text-center py-5">Home Page</h1>
                    <img src="/images/default.jpg" alt="image" /> */}
                    {
                        state ? 
                        <Dashboard /> :<Login />
                    }
        </>
    );
};

export default Home;