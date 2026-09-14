// =====================================================
//  Supabase 연결 설정
//  Publishable key 는 브라우저에 노출되어도 되는 키입니다.
//  보호는 RLS(행 단위 보안) 정책이 담당합니다.
// =====================================================
const SUPABASE_URL = "https://elcgktqkecweekkupjqn.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZVqmcmyrOyyzTyKjJgoVag_xsrw1lr2";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// =====================================================
//  HTML 요소
// =====================================================
const headerSub  = document.getElementById("header-sub");
const loginView  = document.getElementById("login-view");
const listView   = document.getElementById("list-view");
const loginForm  = document.getElementById("login-form");
const emailEl    = document.getElementById("email");
const passwordEl = document.getElementById("password");
const loginBtn   = document.getElementById("login-btn");
const refreshBtn = document.getElementById("refresh-btn");
const logoutBtn  = document.getElementById("logout-btn");
const listEl     = document.getElementById("application-list");
const statusEl   = document.getElementById("status");


// =====================================================
//  상태 메시지
// =====================================================
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "status" + (type ? " " + type : "");
}

function showError(prefix, error) {
  showStatus(prefix + "\n" + JSON.stringify(error, null, 2), "error");
  console.error(prefix, error);
}


// =====================================================
//  화면 전환
//  로그인 상태에 따라 로그인 폼과 목록 중 하나만 보여줍니다.
//
//  ⚠️ 이건 '화면 처리'일 뿐 보안이 아닙니다.
//     개발자도구로 hidden 속성을 지우면 목록 영역이 드러납니다.
//     다만 그래봐야 내용은 비어 있습니다 — 데이터를 막는 건 RLS 이기 때문입니다.
// =====================================================
function showLoginView() {
  loginView.hidden = false;
  listView.hidden = true;
  headerSub.textContent = "로그인이 필요합니다.";
}

function showListView(email) {
  loginView.hidden = true;
  listView.hidden = false;
  headerSub.textContent = email + " 로 로그인됨";
}


// =====================================================
//  신청 목록 그리기
//  JSON 을 그대로 뿌리지 않고 실제 HTML 요소를 만들어 넣습니다.
// =====================================================
function renderApplications(rows) {
  listEl.innerHTML = "";

  if (rows.length === 0) {
    const li = document.createElement("li");
    li.className = "placeholder";
    li.textContent = "신청 내역이 없습니다.";
    listEl.appendChild(li);
    return;
  }

  rows.forEach(function (row) {
    const li = document.createElement("li");
    li.className = "post-item";

    const h3 = document.createElement("h3");
    h3.className = "post-title";
    // textContent 사용 (innerHTML 아님).
    // 신청자가 입력한 값에 <script> 가 섞여 있어도 태그로 해석되지 않습니다.
    h3.textContent = row.name + " · " + row.phone;
    li.appendChild(h3);

    if (row.message) {
      const p = document.createElement("p");
      p.className = "post-content";
      p.textContent = row.message;
      li.appendChild(p);
    }

    const meta = document.createElement("div");
    meta.className = "post-meta";
    meta.textContent =
      "#" + row.id +
      " · " + row.status +
      " · " + new Date(row.created_at).toLocaleString("ko-KR");
    li.appendChild(meta);

    listEl.appendChild(li);
  });
}


// =====================================================
//  신청 목록 불러오기 (SELECT)
//
//  RLS 정책상 admins 명단에 있는 계정만 조회됩니다.
//  로그인만 하고 명단에 없으면 빈 목록이 돌아옵니다 — 오류가 아니라 빈 결과입니다.
// =====================================================
async function loadApplications() {
  refreshBtn.disabled = true;

  const { data, error } = await client
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  refreshBtn.disabled = false;

  if (error) {
    showError("조회 실패", error);
    listEl.innerHTML = "";
    return;
  }

  renderApplications(data);

  if (data.length === 0) {
    showStatus("조회는 성공했지만 결과가 비어 있습니다. 관리자 명단에 등록된 계정인지 확인하세요.", "ok");
  } else {
    showStatus("조회 완료 — " + data.length + "건", "ok");
  }
}


// =====================================================
//  로그인
// =====================================================
async function login(event) {
  event.preventDefault();

  const email    = emailEl.value.trim();
  const password = passwordEl.value;

  loginBtn.disabled = true;
  loginBtn.textContent = "로그인 중…";

  const { data, error } = await client.auth.signInWithPassword({
    email: email,
    password: password
  });

  loginBtn.disabled = false;
  loginBtn.textContent = "로그인";

  if (error) {
    // 어느 쪽이 틀렸는지 알려주지 않습니다.
    // "그런 이메일 없음" 이라고 답하면 어떤 계정이 존재하는지 알려주는 셈이 됩니다.
    showStatus("이메일 또는 비밀번호가 올바르지 않습니다.", "error");
    console.error("로그인 실패", error);
    passwordEl.value = "";
    passwordEl.focus();
    return;
  }

  passwordEl.value = "";
  showStatus("");
  showListView(data.user.email);
  loadApplications();
}


// =====================================================
//  로그아웃
// =====================================================
async function logout() {
  await client.auth.signOut();
  listEl.innerHTML = "";
  showStatus("로그아웃되었습니다.", "ok");
  showLoginView();
}


// =====================================================
//  시작할 때 로그인 상태 확인
//
//  로그인 정보(세션)는 브라우저에 저장되어 있어서,
//  새로고침하거나 나중에 다시 들어와도 로그인 상태가 유지됩니다.
// =====================================================
async function init() {
  const { data } = await client.auth.getSession();

  if (data.session) {
    showListView(data.session.user.email);
    loadApplications();
  } else {
    showLoginView();
  }
}


// =====================================================
//  이벤트 연결
// =====================================================
loginForm.addEventListener("submit", login);
refreshBtn.addEventListener("click", loadApplications);
logoutBtn.addEventListener("click", logout);

init();
