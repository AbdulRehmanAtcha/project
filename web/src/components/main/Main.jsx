import React, { useState, useEffect } from "react";
import "./style.css";
import axios from "axios";

let baseURL = "";
if (window.location.href.split(":")[0] === "http") {
  baseURL = `http://localhost:5001`;
}

const Main = () => {
  axios.defaults.withCredentials = true;
  const [todo, setTodo] = useState("");
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editTodo, setEditTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const addObj = {
    todo: todo,
  };

  const allPosts = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/v1/items`);
      // console.log("Got All Items", response.data.data);
      setItems(response.data.data);
    } catch (error) {
      // console.log("Error", error);
    }
  };

  useEffect(() => {
    allPosts();
    // console.log(state.user)
  }, []);

  const addHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(`${baseURL}/api/v1/item`, addObj)

      .then((response) => {
        // console.log("Response: ", response.data);
        setLoading(false);
        allPosts();
        setTodo("");
      })
      .catch((err) => {
        setLoading(false);
        // console.log("error: ", err);
      });
  };
  const deletItem = async (id) => {
    setLoading(true);
    try {
      const response = await axios.delete(`${baseURL}/api/v1/item/${id}`);
      // console.log("Got All Items", response.data.data);
      setLoading(false)
      allPosts();
    } catch (error) {
      setLoading(false)
      // console.log("Error", error);
    }
  };
  const editTodoHandler = (e) => {
    setEditTodo(e.target.value);
  };
  const editHandler = async (e) => {};
  const updateHandler = (event) => {
    setLoading(true);
    event.preventDefault();
    let newTodo = editTodo;

    axios
      .put(`${baseURL}/api/v1/item/${editId}`, {
        todo: newTodo,
      })
      .then(
        (response) => {
          // setLoading(false)

          // console.log(response);
          setLoading(false);
          allPosts();
        },
        (error) => {
          setLoading(false);

          // console.log(error);
        }
      );
  };
  return (
    <div id="todo-main">
      <div className="head">
        <form onSubmit={addHandler}>
          <input
            type="text"
            placeholder="Enter Here"
            onChange={(e) => {
              setTodo(e.target.value);
            }}
            maxLength="80"
            minLength="3"
            required
            value={todo}
          />
          <button type="submit" id="sub-button">
            ADD
          </button>
        </form>
        <br />
        <br />
        {loading ? (
          <div
            className="loader"
            style={{
              height: "50vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="spinner-grow text-light" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="items">
            {items.map((eachItem, i) => (
              <div className="single-item" key={i}>
                <p>{eachItem?.todo}</p>
                <hr />
                <div className="buttons">
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-toggle="modal"
                    data-target="#exampleModal"
                    onClick={() => {
                      editHandler(setEditId(eachItem._id));
                      setEditTodo(eachItem?.todo)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      deletItem(eachItem._id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <div
              className="modal fade"
              id="exampleModal"
              tabIndex="-1"
              role="dialog"
              aria-labelledby="exampleModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">
                      Edit Your Item
                    </h5>
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                      
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <form>
                      <input
                        type="text"
                        placeholder="Item"
                        onChange={editTodoHandler}
                        value={editTodo}
                      />
                    </form>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-dismiss="modal"
                      onClick={updateHandler}
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
