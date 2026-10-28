const rows = document.getElementById("rows");
const empty = document.getElementById("empty");
let tasks = [];

async function api(path, opts) {
  const r = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  return r.json();
}
async function load() { tasks = await api("/api/tasks"); render(); }

function render() {
  const q = document.getElementById("search").value.toLowerCase();
  const f = document.getElementById("filter").value;
  rows.innerHTML = "";
  const visible = tasks.filter(t => t.title.toLowerCase().includes(q) && (!f || t.status === f));
  visible.forEach(t => {
    const tr = document.createElement("tr");
    if (t.status === "Completed") tr.className = "is-done";
    tr.innerHTML = `<td class="id">${t.id}</td><td class="t"></td>
      <td><span class="pill ${t.priority}">${t.priority}</span></td>
      <td><span class="pill ${t.status}">${t.status}</span></td>
      <td class="created">${t.createdDate || ""}</td>
      <td class="actions"><button class="done">${t.status === "Completed" ? "Reopen" : "Complete"}</button> <button class="del">Delete</button></td>`;
    tr.querySelector(".t").textContent = t.title;
    tr.querySelector(".done").onclick = async () => {
      await api("/api/tasks/" + t.id, { method: "PUT", body: JSON.stringify({ status: t.status === "Completed" ? "Pending" : "Completed" }) });
      load();
    };
    tr.querySelector(".del").onclick = async () => { await api("/api/tasks/" + t.id, { method: "DELETE" }); load(); };
    rows.appendChild(tr);
  });
  empty.hidden = visible.length > 0;
  const done = tasks.filter(t => t.status === "Completed").length;
  document.getElementById("s-total").textContent = tasks.length;
  document.getElementById("s-done").textContent = done;
  document.getElementById("s-pending").textContent = tasks.length - done;
}

document.getElementById("task-form").onsubmit = async (e) => {
  e.preventDefault();
  await api("/api/tasks", { method: "POST", body: JSON.stringify({
    title: document.getElementById("title").value,
    priority: document.getElementById("priority").value,
    status: document.getElementById("status").value }) });
  e.target.reset(); load();
};
document.getElementById("search").oninput = render;
document.getElementById("filter").onchange = render;
load();
