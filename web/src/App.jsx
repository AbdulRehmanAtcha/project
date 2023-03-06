import "./App.css";
import Login from "./components/login/Login";
import Main from "./components/main/Main";
import Register from "./components/register/Register";
import axios from "axios";
import { Route, Routes } from "react-router-dom";
import { GlobalContext } from "./context/Context";
import { useContext } from "react";
import { useEffect } from "react";
let baseURL = "";
if (window.location.href.split(":")[0] === "http") {
  baseURL = `http://localhost:5001`;
}

function App() {
  let { state, dispatch } = useContext(GlobalContext);

  useEffect(() => {
    const getHome = async () => {
      try {
        let response = await axios.get(`${baseURL}/api/v1/profile`, {
          withCredentials: true,
        });
        dispatch({
          type: "USER_LOGIN",
          payload: response.data,
        });
        // console.log("Yes Login");
      } catch (error) {
        // console.log(error);
        // console.log("no Login");
        dispatch({
          type: "USER_LOGOUT",
        });
      }
    };
    getHome();
  }, []);
  return (
    <>
      {state.isLogin === true ? (
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/mainPage" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Main />} />
        </Routes>
      ) : null}
      {state.isLogin === false ? (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="*" element={<Login />} />
        </Routes>
      ) : null}

      {state.isLogin === null ? (
        <Routes>
          <Route
            path="/"
            element={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "100vh",
                  minWidth: "100vw",
                }}
              >
                <div className="spinner-border" role="status"></div>
              </div>
            }
          />
        </Routes>
      ) : null}
    </>
  );
}

export default App;
