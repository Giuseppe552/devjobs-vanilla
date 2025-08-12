const state = {
  jobs: [],
  filters: {
    searchText: "",
    locationText: "",
    fullTimeOnly: false,
    tags: new Set(),
  },
};

const els = {
  list: document.getElementById("jobList"),
  form: document.getElementById("searchForm"),
  searchText: document.getElementById("searchText"),
  locationText: document.getElementById("locationText"),
  fullTimeOnly: document.getElementById("fullTimeOnly"),
  count: document.getElementById("resultsCount"),
  tagBar: document.getElementById("activeTags"),
  themeToggle: document.getElementById("themeToggle"),
  tpl: document.getElementById("jobCardTpl"),
};

// --- Theme ---
(function initTheme(){
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
  els.themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
})();
els.themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  els.themeToggle.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
});

// --- Load data ---
async function loadJobs(){
  const res = await fetch("./data/jobs.json");
  state.jobs = await res.json();
  render();
}

// --- Render ---
function render(){
  const jobs = applyFilters(state.jobs);
  els.list.innerHTML = "";
  els.count.textContent = `${jobs.length} result${jobs.length!==1?"s":""}`;

  for(const job of jobs){
    const li = els.tpl.content.firstElementChild.cloneNode(true);
    li.querySelector(".company").textContent = job.company;
    li.querySelector(".postedAt").textContent = job.postedAt;
    li.querySelector(".contract").textContent = job.contract;
    li.querySelector(".position").textContent = job.position;
    li.querySelector(".location").textContent = job.location;

    const tags = li.querySelector(".tags");
    for(const t of job.tags){
      const b = document.createElement("button");
      b.className = "tag";
      b.type = "button";
      b.textContent = t;
      b.setAttribute("aria-pressed", state.filters.tags.has(t) ? "true" : "false");
      b.addEventListener("click", ()=>toggleTag(t));
      tags.appendChild(b);
    }

    els.list.appendChild(li);
  }

  renderActiveTags();
}

function applyFilters(jobs){
  const s = state.filters.searchText.toLowerCase();
  const loc = state.filters.locationText.toLowerCase();
  const full = state.filters.fullTimeOnly;
  const tagSet = state.filters.tags;

  return jobs.filter(j=>{
    const matchesSearch =
      !s ||
      j.position.toLowerCase().includes(s) ||
      j.company.toLowerCase().includes(s);

    const matchesLoc = !loc || j.location.toLowerCase().includes(loc);
    const matchesFull = !full || j.contract.toLowerCase()==="full time";
    const matchesTags = tagSet.size===0 || [...tagSet].every(t=>j.tags.includes(t));

    return matchesSearch && matchesLoc && matchesFull && matchesTags;
  });
}

// --- Tag UX ---
function toggleTag(tag){
  if(state.filters.tags.has(tag)) state.filters.tags.delete(tag);
  else state.filters.tags.add(tag);
  render();
}

function renderActiveTags(){
  const wrap = els.tagBar;
  wrap.innerHTML = "";
  state.filters.tags.forEach(t=>{
    const chip = document.createElement("button");
    chip.className = "tag-chip";
    chip.type = "button";
    chip.innerHTML = `<span>${t}</span><span class="x" aria-hidden="true">×</span>`;
    chip.setAttribute("aria-label", `Remove tag ${t}`);
    chip.addEventListener("click", ()=>{
      state.filters.tags.delete(t);
      render();
    });
    wrap.appendChild(chip);
  });

  if(state.filters.tags.size>0){
    const clear = document.createElement("button");
    clear.className = "btn";
    clear.type = "button";
    clear.textContent = "Clear";
    clear.addEventListener("click", ()=>{
      state.filters.tags.clear();
      render();
    });
    wrap.appendChild(clear);
  }
}

// --- Form handlers ---
els.form.addEventListener("submit", (e)=>{
  e.preventDefault();
  state.filters.searchText = els.searchText.value.trim();
  state.filters.locationText = els.locationText.value.trim();
  state.filters.fullTimeOnly = els.fullTimeOnly.checked;
  render();
});

loadJobs();
