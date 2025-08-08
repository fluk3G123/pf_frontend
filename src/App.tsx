import { useEffect, useState } from "react";
import axios from "axios";
import { type TodoItem } from "./types";
import dayjs from "dayjs";

type OwnerItem = {
  id: string;
  Name: string;
  course_id: string;
  section: string;
};

function App() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [owners, setOwners] = useState<OwnerItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");
  const [curTodoId, setCurTodoId] = useState("");

  async function fetchData() {
    const [todoRes, ownerRes] = await Promise.all([
      axios.get<TodoItem[]>("/api/todo"),
      axios.get<OwnerItem[]>("/api/todo/owner"),
    ]);
    setTodos(todoRes.data);
    setOwners(ownerRes.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputText(e.target.value);
  }

  function handleSubmit() {
    if (!inputText) return;
    const payload = { todoText: inputText };

    if (mode === "ADD") {
      axios
        .put("/api/todo", payload)
        .then(() => setInputText(""))
        .then(fetchData)
        .catch((err) => alert(err));
    } else {
      axios
        .patch("/api/todo", { id: curTodoId, ...payload })
        .then(() => {
          setInputText("");
          setMode("ADD");
          setCurTodoId("");
        })
        .then(fetchData)
        .catch((err) => alert(err));
    }
  }

  function handleDelete(id: string) {
    axios
      .delete("/api/todo", { data: { id } })
      .then(fetchData)
      .then(() => {
        setMode("ADD");
        setInputText("");
      })
      .catch((err) => alert(err));
  }

  function handleCancel() {
    setMode("ADD");
    setInputText("");
    setCurTodoId("");
  }

  function handleDeleteOwner(id: string) {
    axios
      .delete("/api/todo/owner", { data: { id } })
      .then(fetchData)
      .catch((err) => alert(err));
  }

  return (
    <div className="container">
      <header>
        <h1 className="app-header">Todo App</h1>
      </header>
      <main>
        {/* Todo Section */}
        <section className="todo-section">
          <div className="todo-input-wrapper">
            <input
              type="text"
              onChange={handleChange}
              value={inputText}
              className="todo-input"
              placeholder="Add a new task"
            />
            <button onClick={handleSubmit} className="submit-btn">
              {mode === "ADD" ? "Submit" : "Update"}
            </button>
            {mode === "EDIT" && (
              <button onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            )}
          </div>

          <h2 className="todo-title">📝 Todo List</h2>
          <div className="todo-list">
            {todos.sort(compareDate).map((item, idx) => {
              const { date, time } = formatDateTime(item.createdAt);
              const text = item.todoText;
              return (
                <article
                  key={item.id}
                  className="todo-item"
                >
                  <div className="todo-item-index">({idx + 1})</div>
                  <div className="todo-item-date">📅 {date}</div>
                  <div className="todo-item-time">⏰ {time}</div>
                  <div className="todo-item-text">📰 {text}</div>
                  <div
                    className="todo-item-edit"
                    onClick={() => {
                      setMode("EDIT");
                      setCurTodoId(item.id);
                      setInputText(item.todoText);
                    }}
                  >
                    {curTodoId !== item.id ? "🖊️" : "✍🏻"}
                  </div>

                  {mode === "ADD" && (
                    <div
                      className="todo-item-delete"
                      onClick={() => handleDelete(item.id)}
                    >
                      🗑️
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* Owner Section */}
        <section className="owner-section">
          <h2 className="owner-title">👤 Owner Info</h2>
          <div className="owner-list">
            {owners.map((owner, idx) => (
              <article key={owner.id} className="owner-item">
                <div className="owner-item-index">({idx + 1})</div>
                <div className="owner-item-id">ID: {owner.id}</div>
                <div className="owner-item-name">NAME: {owner.Name}</div>
                <div className="owner-item-course">COURSE: {owner.course_id}</div>
                <div className="owner-item-section">SECTION: {owner.section}</div>
                <div
                  className="owner-item-delete"
                  onClick={() => handleDeleteOwner(owner.id)}
                >
                  🗑️
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

function formatDateTime(dateStr: string) {
  if (!dayjs(dateStr).isValid()) {
    return { date: "N/A", time: "N/A" };
  }
  const dt = dayjs(dateStr);
  const date = dt.format("D/MM/YY");
  const time = dt.format("HH:mm");
  return { date, time };
}

function compareDate(a: TodoItem, b: TodoItem) {
  const da = dayjs(a.createdAt);
  const db = dayjs(b.createdAt);
  return da.isBefore(db) ? -1 : 1;
}