const STORAGE_KEY = "campusvault_students_v1";
const SESSION_KEY = "campusvault_session_v1";

const DEFAULT_STUDENTS = [
  {
    rollNo: "CS2024-101",
    fullName: "Aarav Kulkarni",
    department: "Computer Science",
    yearSem: "3rd Year / Sem 5",
    cgpa: 9.12,
    email: "aarav.k@college.edu",
    status: "Active",
  },
  {
    rollNo: "EC2024-042",
    fullName: "Meera Nair",
    department: "Electronics & Comm.",
    yearSem: "3rd Year / Sem 5",
    cgpa: 8.68,
    email: "meera.n@college.edu",
    status: "Active",
  },
  {
    rollNo: "ME2023-019",
    fullName: "Rohan Verma",
    department: "Mechanical Engineering",
    yearSem: "4th Year / Sem 7",
    cgpa: 8.24,
    email: "rohan.v@college.edu",
    status: "Active",
  },
  {
    rollNo: "CE2025-008",
    fullName: "Diya Menon",
    department: "Civil Engineering",
    yearSem: "2nd Year / Sem 3",
    cgpa: 8.91,
    email: "diya.m@college.edu",
    status: "On Leave",
  },
  {
    rollNo: "BA2022-055",
    fullName: "Kabir Joshi",
    department: "Business Administration",
    yearSem: "Graduated",
    cgpa: 8.55,
    email: "kabir.j@college.edu",
    status: "Graduated",
  },
];

// Elements
const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const userBadge = document.getElementById("userBadge");
const logoutBtn = document.getElementById("logoutBtn");

const statsGrid = document.getElementById("statsGrid");
const searchInput = document.getElementById("searchInput");
const departmentFilter = document.getElementById("departmentFilter");
const studentTableBody = document.getElementById("studentTableBody");
const emptyState = document.getElementById("emptyState");

const studentModal = document.getElementById("studentModal");
const modalTitle = document.getElementById("modalTitle");
const studentForm = document.getElementById("studentForm");
const openAddModalBtn = document.getElementById("openAddModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");

function loadStudents() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STUDENTS));
    return [...DEFAULT_STUDENTS];
  }
  return JSON.parse(raw);
}

function saveStudents(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

let students = loadStudents();

function setLoggedIn(email) {
  sessionStorage.setItem(SESSION_KEY, email);
  userBadge.textContent = email;
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  renderAll();
}

function setLoggedOut() {
  sessionStorage.removeItem(SESSION_KEY);
  dashboardView.classList.add("hidden");
  loginView.classList.remove("hidden");
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  setLoggedIn(loginEmail.value.trim());
});

logoutBtn.addEventListener("click", setLoggedOut);

function statusBadgeClass(status) {
  if (status === "Active") return "badge-active";
  if (status === "On Leave") return "badge-leave";
  return "badge-graduated";
}

function renderStats() {
  const total = students.length;
  const active = students.filter((s) => s.status === "Active").length;
  const avgCgpa =
    total > 0
      ? (students.reduce((acc, s) => acc + Number(s.cgpa || 0), 0) / total).toFixed(2)
      : "0.00";
  const departmentsCount = new Set(students.map((s) => s.department)).size;

  statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total Students</div>
      <div class="stat-value">${total}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Active Enrollments</div>
      <div class="stat-value">${active}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Departments Represented</div>
      <div class="stat-value">${departmentsCount}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Average CGPA</div>
      <div class="stat-value">${avgCgpa}</div>
    </div>
  `;
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();
  const dept = departmentFilter.value;

  const filtered = students.filter((s) => {
    const matchesDept = dept === "All" || s.department === dept;
    const matchesQuery =
      !query ||
      s.fullName.toLowerCase().includes(query) ||
      s.rollNo.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query);
    return matchesDept && matchesQuery;
  });

  studentTableBody.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  filtered.forEach((student) => {
    const realIndex = students.findIndex((item) => item.rollNo === student.rollNo);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${escapeHtml(student.rollNo)}</strong></td>
      <td>${escapeHtml(student.fullName)}</td>
      <td>${escapeHtml(student.department)}</td>
      <td>${escapeHtml(student.yearSem)}</td>
      <td>${Number(student.cgpa).toFixed(2)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td><span class="badge ${statusBadgeClass(student.status)}">${escapeHtml(student.status)}</span></td>
      <td>
        <div class="action-group">
          <button class="btn btn-secondary btn-sm" onclick="openEditModal(${realIndex})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteStudent(${realIndex})">Delete</button>
        </div>
      </td>
    `;
    studentTableBody.appendChild(tr);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function openAddModal() {
  modalTitle.textContent = "Add Student Record";
  studentForm.reset();
  document.getElementById("editIndex").value = "";
  studentModal.classList.remove("hidden");
}

window.openEditModal = function (index) {
  const student = students[index];
  if (!student) return;
  modalTitle.textContent = "Edit Student Record";
  document.getElementById("editIndex").value = index;
  document.getElementById("rollNo").value = student.rollNo;
  document.getElementById("fullName").value = student.fullName;
  document.getElementById("department").value = student.department;
  document.getElementById("yearSem").value = student.yearSem;
  document.getElementById("cgpa").value = student.cgpa;
  document.getElementById("email").value = student.email;
  document.getElementById("status").value = student.status;
  studentModal.classList.remove("hidden");
};

window.deleteStudent = function (index) {
  const target = students[index];
  if (!target) return;
  if (confirm(`Delete record for ${target.fullName} (${target.rollNo})?`)) {
    students.splice(index, 1);
    saveStudents(students);
    renderAll();
  }
};

function closeModal() {
  studentModal.classList.add("hidden");
}

openAddModalBtn.addEventListener("click", openAddModal);
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

studentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const editIndex = document.getElementById("editIndex").value;
  const record = {
    rollNo: document.getElementById("rollNo").value.trim(),
    fullName: document.getElementById("fullName").value.trim(),
    department: document.getElementById("department").value,
    yearSem: document.getElementById("yearSem").value.trim(),
    cgpa: parseFloat(document.getElementById("cgpa").value),
    email: document.getElementById("email").value.trim(),
    status: document.getElementById("status").value,
  };

  if (editIndex === "") {
    students.unshift(record);
  } else {
    students[Number(editIndex)] = record;
  }

  saveStudents(students);
  closeModal();
  renderAll();
});

exportCsvBtn.addEventListener("click", () => {
  const headers = ["Roll No", "Full Name", "Department", "Year/Sem", "CGPA", "Email", "Status"];
  const rows = students.map((s) =>
    [s.rollNo, s.fullName, s.department, s.yearSem, s.cgpa, s.email, s.status]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "student-records.csv";
  a.click();
  URL.revokeObjectURL(url);
});

searchInput.addEventListener("input", renderTable);
departmentFilter.addEventListener("change", renderTable);

function renderAll() {
  renderStats();
  renderTable();
}

const existingSession = sessionStorage.getItem(SESSION_KEY);
if (existingSession) {
  setLoggedIn(existingSession);
}