import React, { useState, useContext } from "react";
import { GlobalContext } from "../../context/Context";
import "./style.css";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";


let baseURL = "";
if (window.location.href.split(":")[0] === "http") {
  baseURL = "http://localhost:5001";
}

const Login = () => {
  const navigate = useNavigate();

  let { dispatch } = useContext(GlobalContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${baseURL}/api/v1/login`,
        {
          email: email,
          password: password,
        },
        {
          withCredentials: true,
        }
      );
      // alert(response.data.message);
      console.log(response)
      dispatch({
        type: "USER_LOGIN",
        payload: response.data.profile,
      });
      navigate("/");
      // alert(response.data.message);
      // console.log(response);
    } catch {
      console.log("Error", e);
      alert("Invalid Email Or Password")
    }
  };
  return (
    <div id="login-main">
      <form onSubmit={loginHandler}>
        <input
          type="email"
          className="form-control"
          placeholder="Enter Your Email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          name="email"
          required
        />
        <input
          type="text"
          className="form-control"
          placeholder="Enter Password"
          required
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          minLength={3}
        />
        <div className="d-grid gap-2 col-12 mx-auto">
          <button
            className="btn btn-primary"
            type="submit"
          >
            LOGIN
          </button>
        </div>
      </form>
      <span
        style={{ color: "aliceblue", textAlign: "center", fontSize: "20px" }}
      >
        Don't Have An Account?
      </span>
      <NavLink to="/signup">
        <span
          style={{ color: "black", fontWeight: "bolder", cursor: "pointer" }}
        >
          Click Here
        </span>
      </NavLink>
    </div>
  );
};

export default Login;
