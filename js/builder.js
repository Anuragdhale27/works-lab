/* ============================================================
   WORKS LAB — builder.js
   Resume data model, rendering engine, PDF download
   ============================================================ */

// ---- Data model ----
let resumeData = {
  personal: { name: "", title: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: []
};

let currentTemplate = "modern";

// ---- Get template from URL ----
function getTemplateFromURL() {
  const params = new URLSearchParams(window.location.search);
  const t = params.get("template");
  return (t && TEMPLATES[t]) ? t : "modern";
}

// ---- LocalStorage ----
const LS_KEY = "workslab_resume_data";

function saveToStorage() {
  localStorage.setItem(LS_KEY, JSON.stringify(resumeData));
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      resumeData = JSON.parse(saved);
      populateForm();
    }
  } catch(e) {}
}

// ---- Debounce ----
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ============================================================
// TEMPLATE RENDERERS
// Add more templates by adding a function here and registering
// in the templateRenderers map below.
// ============================================================

function renderModernResume(data) {
  const p = data.personal;
  const initials = (p.name || "YN").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  return `
<div class="resume-modern">
  <div class="rmod-header">
    <div class="rmod-name">${esc(p.name || "Your Name")}</div>
    <div class="rmod-title">${esc(p.title || "Professional Title")}</div>
    <div class="rmod-contact">
      ${p.email ? `<span>✉ ${esc(p.email)}</span>` : ""}
      ${p.phone ? `<span>📞 ${esc(p.phone)}</span>` : ""}
      ${p.location ? `<span>📍 ${esc(p.location)}</span>` : ""}
      ${p.linkedin ? `<span>🔗 ${esc(p.linkedin)}</span>` : ""}
      ${p.portfolio ? `<span>🌐 ${esc(p.portfolio)}</span>` : ""}
    </div>
  </div>
  <div class="rmod-body">
    ${data.summary ? `
    <div class="rmod-section">
      <div class="rmod-section-title">Professional Summary</div>
      <div style="font-size:10px;color:#333;line-height:1.7">${esc(data.summary)}</div>
    </div>` : ""}

    ${data.experience.length ? `
    <div class="rmod-section">
      <div class="rmod-section-title">Work Experience</div>
      ${data.experience.map(exp => `
        <div class="rmod-exp-item">
          <div class="rmod-exp-header">
            <div class="rmod-exp-title">${esc(exp.title || "Job Title")}</div>
            <div class="rmod-exp-date">${esc(exp.start || "")}${exp.start || exp.end ? " – " : ""}${esc(exp.end || "Present")}</div>
          </div>
          <div class="rmod-exp-company">${esc(exp.company || "")}${exp.location ? ` · ${esc(exp.location)}` : ""}</div>
          ${exp.description ? `<div class="rmod-exp-desc">${esc(exp.description)}</div>` : ""}
        </div>
      `).join("")}
    </div>` : ""}

    ${data.education.length ? `
    <div class="rmod-section">
      <div class="rmod-section-title">Education</div>
      ${data.education.map(edu => `
        <div class="rmod-edu-item">
          <div class="rmod-edu-degree">${esc(edu.degree || "Degree")}</div>
          <div class="rmod-edu-school">${esc(edu.institution || "")}${edu.location ? ` · ${esc(edu.location)}` : ""}</div>
          <div class="rmod-edu-year">${edu.start || edu.end ? `${esc(edu.start || "")} – ${esc(edu.end || "Present")}` : ""}${edu.description ? ` · ${esc(edu.description)}` : ""}</div>
        </div>
      `).join("")}
    </div>` : ""}

    ${data.skills.length ? `
    <div class="rmod-section">
      <div class="rmod-section-title">Skills</div>
      <div class="rmod-skills">${data.skills.map(s => `<span class="rmod-skill">${esc(s)}</span>`).join("")}</div>
    </div>` : ""}

    ${data.projects.length ? `
    <div class="rmod-section">
      <div class="rmod-section-title">Projects</div>
      ${data.projects.map(pr => `
        <div class="rmod-exp-item">
          <div class="rmod-exp-header">
            <div class="rmod-exp-title">${esc(pr.name || "Project")}</div>
            ${pr.url ? `<div class="rmod-exp-date" style="color:#2563eb">${esc(pr.url)}</div>` : ""}
          </div>
          ${pr.tech ? `<div class="rmod-exp-company">${esc(pr.tech)}</div>` : ""}
          ${pr.description ? `<div class="rmod-exp-desc">${esc(pr.description)}</div>` : ""}
        </div>
      `).join("")}
    </div>` : ""}

    ${data.certifications.length ? `
    <div class="rmod-section">
      <div class="rmod-section-title">Certifications</div>
      ${data.certifications.map(c => `
        <div class="rmod-exp-item">
          <div class="rmod-exp-header">
            <div class="rmod-exp-title">${esc(c.name || "Certification")}</div>
            <div class="rmod-exp-date">${esc(c.year || "")}</div>
          </div>
          <div class="rmod-exp-company">${esc(c.org || "")}</div>
        </div>
      `).join("")}
    </div>` : ""}

    ${data.languages.length ? `
    <div class="rmod-section">
      <div class="rmod-section-title">Languages</div>
      <div class="rmod-skills">${data.languages.map(l => `<span class="rmod-skill">${esc(l.lang)}${l.level ? ` · ${esc(l.level)}` : ""}</span>`).join("")}</div>
    </div>` : ""}
  </div>
</div>`;
}

function renderClassicResume(data) {
  const p = data.personal;
  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean);
  return `
<div class="resume-classic">
  <div class="rcls-name">${esc(p.name || "Your Name")}</div>
  <div class="rcls-title">${esc(p.title || "Professional Title")}</div>
  <div class="rcls-contact">${contactParts.map(esc).join("  |  ")}</div>
  <hr class="rcls-divider">

  ${data.summary ? `
  <div class="rcls-section-title">Professional Summary</div>
  <div class="rcls-desc" style="margin-bottom:10px">${esc(data.summary)}</div>
  ` : ""}

  ${data.experience.length ? `
  <div class="rcls-section-title">Work Experience</div>
  ${data.experience.map(exp => `
    <div class="rcls-exp-item">
      <div class="rcls-exp-header">
        <div class="rcls-exp-title">${esc(exp.title || "Job Title")}, ${esc(exp.company || "Company")}</div>
        <div class="rcls-exp-date">${esc(exp.start || "")} – ${esc(exp.end || "Present")}</div>
      </div>
      <div class="rcls-exp-sub">${esc(exp.location || "")}</div>
      <div class="rcls-desc">${esc(exp.description || "")}</div>
    </div>
  `).join("")}` : ""}

  ${data.education.length ? `
  <div class="rcls-section-title">Education</div>
  ${data.education.map(edu => `
    <div class="rcls-exp-item">
      <div class="rcls-exp-header">
        <div class="rcls-exp-title">${esc(edu.degree || "Degree")}</div>
        <div class="rcls-exp-date">${esc(edu.start || "")} – ${esc(edu.end || "")}</div>
      </div>
      <div class="rcls-exp-sub">${esc(edu.institution || "")}${edu.location ? `, ${esc(edu.location)}` : ""}</div>
    </div>
  `).join("")}` : ""}

  ${data.skills.length ? `
  <div class="rcls-section-title">Skills</div>
  <div class="rcls-skills-list">${data.skills.join(" · ")}</div>` : ""}

  ${data.projects.length ? `
  <div class="rcls-section-title">Projects</div>
  ${data.projects.map(pr => `
    <div class="rcls-exp-item">
      <div class="rcls-exp-title">${esc(pr.name || "Project")}</div>
      <div class="rcls-exp-sub">${esc(pr.tech || "")}</div>
      <div class="rcls-desc">${esc(pr.description || "")}</div>
    </div>
  `).join("")}` : ""}

  ${data.certifications.length ? `
  <div class="rcls-section-title">Certifications</div>
  ${data.certifications.map(c => `
    <div class="rcls-exp-item">
      <div class="rcls-exp-header">
        <div class="rcls-exp-title">${esc(c.name || "")}</div>
        <div class="rcls-exp-date">${esc(c.year || "")}</div>
      </div>
      <div class="rcls-exp-sub">${esc(c.org || "")}</div>
    </div>
  `).join("")}` : ""}

  ${data.languages.length ? `
  <div class="rcls-section-title">Languages</div>
  <div class="rcls-skills-list">${data.languages.map(l => `${esc(l.lang)}${l.level ? ` (${esc(l.level)})` : ""}`).join(" · ")}</div>` : ""}
</div>`;
}

function renderMinimalResume(data) {
  const p = data.personal;
  const initials = (p.name || "YN").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  return `
<div class="resume-minimal">
  <div class="rmin-sidebar">
    <div class="rmin-avatar">${initials}</div>
    <div class="rmin-name">${esc(p.name || "Your Name")}</div>
    <div class="rmin-title">${esc(p.title || "Professional Title")}</div>

    <div class="rmin-label">Contact</div>
    ${p.email ? `<div class="rmin-detail">✉ ${esc(p.email)}</div>` : ""}
    ${p.phone ? `<div class="rmin-detail">📞 ${esc(p.phone)}</div>` : ""}
    ${p.location ? `<div class="rmin-detail">📍 ${esc(p.location)}</div>` : ""}
    ${p.linkedin ? `<div class="rmin-detail">🔗 ${esc(p.linkedin)}</div>` : ""}

    ${data.skills.length ? `
    <div class="rmin-label">Skills</div>
    ${data.skills.map(s => `
      <div class="rmin-skill-name">${esc(s)}</div>
      <div class="rmin-skill-bar"><div class="rmin-skill-fill" style="width:80%"></div></div>
    `).join("")}` : ""}

    ${data.languages.length ? `
    <div class="rmin-label">Languages</div>
    ${data.languages.map(l => `<div class="rmin-detail">${esc(l.lang)}${l.level ? ` · ${esc(l.level)}` : ""}</div>`).join("")}` : ""}
  </div>

  <div class="rmin-main">
    ${data.summary ? `
    <div class="rmin-section-title">Summary</div>
    <div class="rmin-desc">${esc(data.summary)}</div>` : ""}

    ${data.experience.length ? `
    <div class="rmin-section-title">Experience</div>
    ${data.experience.map(exp => `
      <div style="margin-bottom:12px">
        <div class="rmin-exp-title">${esc(exp.title || "Job Title")}</div>
        <div class="rmin-exp-sub">${esc(exp.company || "")} ${exp.location ? `· ${esc(exp.location)}` : ""} ${exp.start ? `· ${esc(exp.start)} – ${esc(exp.end || "Present")}` : ""}</div>
        <div class="rmin-desc">${esc(exp.description || "")}</div>
      </div>
    `).join("")}` : ""}

    ${data.education.length ? `
    <div class="rmin-section-title">Education</div>
    ${data.education.map(edu => `
      <div style="margin-bottom:10px">
        <div class="rmin-exp-title">${esc(edu.degree || "Degree")}</div>
        <div class="rmin-exp-sub">${esc(edu.institution || "")} ${edu.start ? `· ${esc(edu.start)} – ${esc(edu.end || "")}` : ""}</div>
      </div>
    `).join("")}` : ""}

    ${data.projects.length ? `
    <div class="rmin-section-title">Projects</div>
    ${data.projects.map(pr => `
      <div style="margin-bottom:10px">
        <div class="rmin-exp-title">${esc(pr.name || "Project")}</div>
        ${pr.tech ? `<div class="rmin-exp-sub">${esc(pr.tech)}</div>` : ""}
        <div class="rmin-desc">${esc(pr.description || "")}</div>
      </div>
    `).join("")}` : ""}

    ${data.certifications.length ? `
    <div class="rmin-section-title">Certifications</div>
    ${data.certifications.map(c => `
      <div class="rmin-exp-title">${esc(c.name || "")} <span style="font-weight:400;font-size:9px;color:#888">${esc(c.org || "")} ${esc(c.year || "")}</span></div>
    `).join("")}` : ""}
  </div>
</div>`;
}

function renderExecutiveResume(data) {
  const p = data.personal;
  const contactParts = [p.email, p.phone, p.location, p.linkedin].filter(Boolean);
  return `
<div class="resume-executive">
  <div class="rexe-header">
    <div class="rexe-name">${esc(p.name || "Your Name")}</div>
    <div class="rexe-title">${esc(p.title || "Professional Title")}</div>
    <div class="rexe-contact">${contactParts.map(esc).join("  ·  ")}</div>
  </div>
  <div class="rexe-body">

    ${data.summary ? `
    <div class="rexe-section-title">Executive Profile</div>
    <hr class="rexe-divider">
    <div style="font-size:10px;color:rgba(255,255,255,0.65);line-height:1.7;margin-bottom:14px">${esc(data.summary)}</div>` : ""}

    ${data.experience.length ? `
    <div class="rexe-section-title">Professional Experience</div>
    <hr class="rexe-divider">
    ${data.experience.map(exp => `
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div class="rexe-exp-title">${esc(exp.title || "Job Title")}</div>
          <div style="font-size:9px;color:rgba(255,255,255,0.4)">${esc(exp.start || "")} – ${esc(exp.end || "Present")}</div>
        </div>
        <div class="rexe-exp-sub">${esc(exp.company || "")}${exp.location ? ` · ${esc(exp.location)}` : ""}</div>
        <div class="rexe-desc">${esc(exp.description || "")}</div>
      </div>
    `).join("")}` : ""}

    ${data.skills.length ? `
    <div class="rexe-section-title">Core Competencies</div>
    <hr class="rexe-divider">
    <div class="rexe-skills" style="margin-bottom:16px">${data.skills.map(s => `<span class="rexe-skill">${esc(s)}</span>`).join("")}</div>` : ""}

    ${data.education.length ? `
    <div class="rexe-section-title">Education</div>
    <hr class="rexe-divider">
    ${data.education.map(edu => `
      <div style="margin-bottom:10px">
        <div class="rexe-exp-title">${esc(edu.degree || "Degree")}</div>
        <div class="rexe-exp-sub">${esc(edu.institution || "")} ${edu.end ? `· ${esc(edu.end)}` : ""}</div>
      </div>
    `).join("")}` : ""}

    ${data.certifications.length ? `
    <div class="rexe-section-title">Certifications</div>
    <hr class="rexe-divider">
    ${data.certifications.map(c => `
      <div style="margin-bottom:6px">
        <div class="rexe-exp-title">${esc(c.name || "")}</div>
        <div class="rexe-exp-sub">${esc(c.org || "")} ${esc(c.year || "")}</div>
      </div>
    `).join("")}` : ""}
  </div>
</div>`;
}

// ---- Template renderer map ----
// HOW TO ADD A NEW TEMPLATE:
// 1. Write a function: function renderYourResume(data) { return `<div>...</div>`; }
// 2. Add it to this object: yourkey: renderYourResume
// 3. Add the template card to index.html TEMPLATES section
const templateRenderers = {
  modern:    renderModernResume,
  classic:   renderClassicResume,
  minimal:   renderMinimalResume,
  executive: renderExecutiveResume
};

// ---- Escape HTML ----
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

// ---- Render preview ----
function renderPreview() {
  const container = document.getElementById("resumePreview");
  if (!container) return;
  const renderer = templateRenderers[currentTemplate] || renderModernResume;
  container.innerHTML = renderer(resumeData);
}

const debouncedRender = debounce(renderPreview, 150);

// ---- Form population ----
function populateForm() {
  const p = resumeData.personal;
  setVal("name", p.name); setVal("title", p.title); setVal("email", p.email);
  setVal("phone", p.phone); setVal("location", p.location);
  setVal("linkedin", p.linkedin); setVal("portfolio", p.portfolio);
  setVal("summary", resumeData.summary);

  // Rebuild dynamic sections
  rebuildExperience();
  rebuildEducation();
  rebuildSkills();
  rebuildProjects();
  rebuildCertifications();
  rebuildLanguages();
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || "";
}

// ============================================================
// Dynamic section builders
// ============================================================

function rebuildExperience() {
  const c = document.getElementById("expEntries");
  if (!c) return;
  c.innerHTML = "";
  resumeData.experience.forEach((_, i) => appendExpEntry(i));
}

function appendExpEntry(i) {
  const exp = resumeData.experience[i];
  const c = document.getElementById("expEntries");
  const div = document.createElement("div");
  div.className = "entry-card";
  div.dataset.index = i;
  div.innerHTML = `
    <div class="entry-card-header">
      <div class="entry-card-title">Experience ${i + 1}</div>
      <button class="btn-remove" onclick="removeExp(${i})">Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Company</label>
        <input class="form-input" placeholder="Infosys" value="${esc(exp.company||"")}" oninput="updateExp(${i},'company',this.value)"></div>
      <div class="form-group"><label class="form-label">Job Title</label>
        <input class="form-input" placeholder="Software Engineer" value="${esc(exp.title||"")}" oninput="updateExp(${i},'title',this.value)"></div>
    </div>
    <div class="form-group"><label class="form-label">Location</label>
      <input class="form-input" placeholder="Bengaluru, India" value="${esc(exp.location||"")}" oninput="updateExp(${i},'location',this.value)"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Start Date</label>
        <input class="form-input" placeholder="Jun 2022" value="${esc(exp.start||"")}" oninput="updateExp(${i},'start',this.value)"></div>
      <div class="form-group"><label class="form-label">End Date</label>
        <input class="form-input" placeholder="Present" value="${esc(exp.end||"")}" oninput="updateExp(${i},'end',this.value)"></div>
    </div>
    <div class="form-group"><label class="form-label">Responsibilities</label>
      <textarea class="form-textarea" placeholder="Describe your role and achievements..." oninput="updateExp(${i},'description',this.value)">${esc(exp.description||"")}</textarea></div>
  `;
  c.appendChild(div);
}

function updateExp(i, key, val) { resumeData.experience[i][key] = val; saveAndRender(); }
function removeExp(i) { resumeData.experience.splice(i, 1); saveAndRender(); rebuildExperience(); }
function addExp() {
  resumeData.experience.push({ company: "", title: "", location: "", start: "", end: "", description: "" });
  appendExpEntry(resumeData.experience.length - 1);
  saveAndRender();
}

function rebuildEducation() {
  const c = document.getElementById("eduEntries");
  if (!c) return;
  c.innerHTML = "";
  resumeData.education.forEach((_, i) => appendEduEntry(i));
}

function appendEduEntry(i) {
  const edu = resumeData.education[i];
  const c = document.getElementById("eduEntries");
  const div = document.createElement("div");
  div.className = "entry-card";
  div.innerHTML = `
    <div class="entry-card-header">
      <div class="entry-card-title">Education ${i + 1}</div>
      <button class="btn-remove" onclick="removeEdu(${i})">Remove</button>
    </div>
    <div class="form-group"><label class="form-label">Degree / Course</label>
      <input class="form-input" placeholder="B.Tech Computer Science" value="${esc(edu.degree||"")}" oninput="updateEdu(${i},'degree',this.value)"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Institution</label>
        <input class="form-input" placeholder="IIT Bombay" value="${esc(edu.institution||"")}" oninput="updateEdu(${i},'institution',this.value)"></div>
      <div class="form-group"><label class="form-label">Location</label>
        <input class="form-input" placeholder="Mumbai" value="${esc(edu.location||"")}" oninput="updateEdu(${i},'location',this.value)"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Start Year</label>
        <input class="form-input" placeholder="2019" value="${esc(edu.start||"")}" oninput="updateEdu(${i},'start',this.value)"></div>
      <div class="form-group"><label class="form-label">End Year</label>
        <input class="form-input" placeholder="2023" value="${esc(edu.end||"")}" oninput="updateEdu(${i},'end',this.value)"></div>
    </div>
    <div class="form-group"><label class="form-label">Notes (GPA / Achievements)</label>
      <input class="form-input" placeholder="CGPA: 8.5 / Scholarship recipient" value="${esc(edu.description||"")}" oninput="updateEdu(${i},'description',this.value)"></div>
  `;
  c.appendChild(div);
}

function updateEdu(i, key, val) { resumeData.education[i][key] = val; saveAndRender(); }
function removeEdu(i) { resumeData.education.splice(i, 1); saveAndRender(); rebuildEducation(); }
function addEdu() {
  resumeData.education.push({ degree: "", institution: "", location: "", start: "", end: "", description: "" });
  appendEduEntry(resumeData.education.length - 1);
  saveAndRender();
}

// Skills
function rebuildSkills() {
  const c = document.getElementById("skillTags");
  if (!c) return;
  c.innerHTML = resumeData.skills.map((s, i) => `
    <span class="skill-tag">${esc(s)} <button onclick="removeSkill(${i})">×</button></span>
  `).join("");
}

function addSkill() {
  const inp = document.getElementById("skillInput");
  const val = inp.value.trim();
  if (!val) return;
  resumeData.skills.push(val);
  inp.value = "";
  rebuildSkills();
  saveAndRender();
}

function removeSkill(i) {
  resumeData.skills.splice(i, 1);
  rebuildSkills();
  saveAndRender();
}

// Projects
function rebuildProjects() {
  const c = document.getElementById("projEntries");
  if (!c) return;
  c.innerHTML = "";
  resumeData.projects.forEach((_, i) => appendProjEntry(i));
}

function appendProjEntry(i) {
  const pr = resumeData.projects[i];
  const c = document.getElementById("projEntries");
  const div = document.createElement("div");
  div.className = "entry-card";
  div.innerHTML = `
    <div class="entry-card-header">
      <div class="entry-card-title">Project ${i + 1}</div>
      <button class="btn-remove" onclick="removeProj(${i})">Remove</button>
    </div>
    <div class="form-group"><label class="form-label">Project Name</label>
      <input class="form-input" placeholder="E-commerce Platform" value="${esc(pr.name||"")}" oninput="updateProj(${i},'name',this.value)"></div>
    <div class="form-group"><label class="form-label">Technologies Used</label>
      <input class="form-input" placeholder="React, Node.js, MongoDB" value="${esc(pr.tech||"")}" oninput="updateProj(${i},'tech',this.value)"></div>
    <div class="form-group"><label class="form-label">Project URL (optional)</label>
      <input class="form-input" placeholder="github.com/username/project" value="${esc(pr.url||"")}" oninput="updateProj(${i},'url',this.value)"></div>
    <div class="form-group"><label class="form-label">Description</label>
      <textarea class="form-textarea" placeholder="What you built and what it achieved..." oninput="updateProj(${i},'description',this.value)">${esc(pr.description||"")}</textarea></div>
  `;
  c.appendChild(div);
}

function updateProj(i, key, val) { resumeData.projects[i][key] = val; saveAndRender(); }
function removeProj(i) { resumeData.projects.splice(i, 1); saveAndRender(); rebuildProjects(); }
function addProj() {
  resumeData.projects.push({ name: "", tech: "", url: "", description: "" });
  appendProjEntry(resumeData.projects.length - 1);
  saveAndRender();
}

// Certifications
function rebuildCertifications() {
  const c = document.getElementById("certEntries");
  if (!c) return;
  c.innerHTML = "";
  resumeData.certifications.forEach((_, i) => appendCertEntry(i));
}

function appendCertEntry(i) {
  const cert = resumeData.certifications[i];
  const c = document.getElementById("certEntries");
  const div = document.createElement("div");
  div.className = "entry-card";
  div.innerHTML = `
    <div class="entry-card-header">
      <div class="entry-card-title">Certification ${i + 1}</div>
      <button class="btn-remove" onclick="removeCert(${i})">Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Certification Name</label>
        <input class="form-input" placeholder="AWS Cloud Practitioner" value="${esc(cert.name||"")}" oninput="updateCert(${i},'name',this.value)"></div>
      <div class="form-group"><label class="form-label">Issuing Organization</label>
        <input class="form-input" placeholder="Amazon Web Services" value="${esc(cert.org||"")}" oninput="updateCert(${i},'org',this.value)"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Year</label>
        <input class="form-input" placeholder="2024" value="${esc(cert.year||"")}" oninput="updateCert(${i},'year',this.value)"></div>
      <div class="form-group"><label class="form-label">Credential URL (optional)</label>
        <input class="form-input" placeholder="credly.com/badges/..." value="${esc(cert.url||"")}" oninput="updateCert(${i},'url',this.value)"></div>
    </div>
  `;
  c.appendChild(div);
}

function updateCert(i, key, val) { resumeData.certifications[i][key] = val; saveAndRender(); }
function removeCert(i) { resumeData.certifications.splice(i, 1); saveAndRender(); rebuildCertifications(); }
function addCert() {
  resumeData.certifications.push({ name: "", org: "", year: "", url: "" });
  appendCertEntry(resumeData.certifications.length - 1);
  saveAndRender();
}

// Languages
function rebuildLanguages() {
  const c = document.getElementById("langEntries");
  if (!c) return;
  c.innerHTML = "";
  resumeData.languages.forEach((_, i) => appendLangEntry(i));
}

function appendLangEntry(i) {
  const lang = resumeData.languages[i];
  const c = document.getElementById("langEntries");
  const div = document.createElement("div");
  div.className = "entry-card";
  div.innerHTML = `
    <div class="entry-card-header">
      <div class="entry-card-title">Language ${i + 1}</div>
      <button class="btn-remove" onclick="removeLang(${i})">Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Language</label>
        <input class="form-input" placeholder="Hindi" value="${esc(lang.lang||"")}" oninput="updateLang(${i},'lang',this.value)"></div>
      <div class="form-group"><label class="form-label">Level</label>
        <select class="form-select" onchange="updateLang(${i},'level',this.value)">
          <option value="">Select level</option>
          ${["Native","Fluent","Professional","Conversational","Basic"].map(l => 
            `<option ${lang.level===l?"selected":""}>${l}</option>`).join("")}
        </select></div>
    </div>
  `;
  c.appendChild(div);
}

function updateLang(i, key, val) { resumeData.languages[i][key] = val; saveAndRender(); }
function removeLang(i) { resumeData.languages.splice(i, 1); saveAndRender(); rebuildLanguages(); }
function addLang() {
  resumeData.languages.push({ lang: "", level: "" });
  appendLangEntry(resumeData.languages.length - 1);
  saveAndRender();
}

function saveAndRender() {
  saveToStorage();
  debouncedRender();
}

// ---- PDF Download ----
function downloadPDF() {
  const btn = document.getElementById("downloadBtn");
  if (btn) { btn.textContent = "Generating..."; btn.disabled = true; }

  const el = document.getElementById("resumePreview");
  const opt = {
    margin: 0,
    filename: (resumeData.personal.name || "resume").replace(/\s+/g, "_") + "_resume.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(opt).from(el).save().then(() => {
    if (btn) { btn.textContent = "Download PDF"; btn.disabled = false; }
    showToast("Resume downloaded!");
  }).catch(() => {
    if (btn) { btn.textContent = "Download PDF"; btn.disabled = false; }
    showToast("Download failed. Please try again.");
  });
}

// ---- Init builder ----
function initBuilder() {
  currentTemplate = getTemplateFromURL();

  // Show template name in header
  const tmplEl = document.getElementById("selectedTemplateName");
  if (tmplEl && TEMPLATES[currentTemplate]) {
    tmplEl.textContent = TEMPLATES[currentTemplate].name;
  }

  loadFromStorage();
  renderPreview();

  // Personal info live update
  ["name","title","email","phone","location","linkedin","portfolio"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      resumeData.personal[id] = el.value;
      saveAndRender();
    });
  });

  // Summary
  const sumEl = document.getElementById("summary");
  if (sumEl) sumEl.addEventListener("input", () => {
    resumeData.summary = sumEl.value;
    saveAndRender();
  });

  // Skill input on Enter
  const skillInp = document.getElementById("skillInput");
  if (skillInp) skillInp.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
  });

  // Download btn
  const dlBtn = document.getElementById("downloadBtn");
  if (dlBtn) dlBtn.addEventListener("click", downloadPDF);
}

document.addEventListener("DOMContentLoaded", initBuilder);
