// VITE_API_URL is set in Railway (Variables tab of the frontend service)
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const list = document.getElementById("list");
const form = document.getElementById("form");
const input = document.getElementById("text");
const status = document.getElementById("status");

status.textContent = "API: " + API;

async function load() {
  try {
    const res = await fetch(API + "/api/notes");
    const notes = await res.json();
    list.innerHTML = "";
    notes.forEach((n) => {
      const li = document.createElement("li");
      li.textContent = n.text;
      const btn = document.createElement("button");
      btn.textContent = "Delete";
      btn.onclick = async () => {
        await fetch(API + "/api/notes/" + n.id, { method: "DELETE" });
        load();
      };
      li.appendChild(btn);
      list.appendChild(li);
    });
  } catch (e) {
    status.textContent = "Cannot reach backend at " + API;
  }
}

form.onsubmit = async (e) => {
  e.preventDefault();
  if (!input.value.trim()) return;
  await fetch(API + "/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input.value }),
  });
  input.value = "";
  load();
};

load();
