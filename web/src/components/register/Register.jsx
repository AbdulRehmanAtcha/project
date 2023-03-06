import React, { useState } from "react";
import axios from "axios";
import "./style.css";
import { NavLink, useNavigate } from "react-router-dom";

let baseURL = "";
if (window.location.href.split(":")[0] === "http") {
  baseURL = "http://localhost:5001";
}

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conPassword, setConPassword] = useState("");
  const navigate = useNavigate();
  const signupHandler = (e) => {
    e.preventDefault();
    if (password === conPassword) {
      axios
        .post(`${baseURL}/api/v1/signup`, {
          name: name,
          email: email,
          password: password,
        })
        .then((response) => {
          navigate("/login");
          if (response?.data?.keyPattern?.email === 1) {
            alert("This Email is already registered");
          }
          //  else {
          //   alert(response?.data?.message);
          // }
          //   console.log(response);
        })
        .catch((err) => {
          // console.log(err.message);
          if (err.message === "Request failed with status code 400") {
            alert("This Email already Exist");
          }
        });
      // console.log(gender);
    } else {
      alert("Password Did'nt Match");
    }
  };
  return (
    <div id="main">
      <form onSubmit={signupHandler}>
        <input
          type="text"
          className="form-control"
          required
          minLength={3}
          onChange={(e) => {
            setName(e.target.value);
          }}
          placeholder="Enter Your Name"
          name="name"
        />
        <input
          name="email"
          type="email"
          className="form-control"
          placeholder="Enter Your Email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
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
        <input
          type="text"
          className="form-control"
          placeholder="Confirm Password"
          required
          onChange={(e) => {
            setConPassword(e.target.value);
          }}
          minLength={3}
        />
        <div className="d-grid gap-2 col-12 mx-auto">
          <button className="btn btn-primary" type="submit">
            Register
          </button>
        </div>
      </form>
      <span
        style={{ color: "aliceblue", textAlign: "center", fontSize: "20px" }}
      >
        Already Have An Account?
      </span>
      <NavLink to="/login">
        <span
          style={{ color: "black", fontWeight: "bolder", cursor: "pointer" }}
        >
          Click Here
        </span>
      </NavLink>
    </div>
  );
};

export default Register;
