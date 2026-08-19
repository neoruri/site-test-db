// =====================================================
//  Supabase 연결 설정
//  ※ 아래 두 값만 본인 프로젝트 값으로 바꾸면 됩니다.
//    Publishable key 는 브라우저에 노출되어도 되는 키입니다.
//    Secret key 는 절대 여기에 넣지 마세요. (RLS를 우회합니다)
// =====================================================
const SUPABASE_URL = "https://elcgktqkecweekkupjqn.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZVqmcmyrOyyzTyKjJgoVag_xsrw1lr2";

// CDN으로 불러온 라이브러리가 전역에 supabase 라는 이름을 만들어 둡니다.
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// =====================================================
//  HTML 요소 가져오기
//  index.html 의 id 와 짝이 맞아야 합니다.
// =====================================================
const form      = document.getElementById("post-form");
const titleEl   = document.getElementById("title");
const contentEl = document.getElementById("content");
const submitBtn = document.getElementById("submit-btn");
const refreshBtn= document.getElementById("refresh-btn");
const listEl    = document.getElementById("post-list");
const statusEl  = document.getElementById("status");


// =====================================================
//  화면에 상태 메시지 표시
// =====================================================
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "status" + (type ? " " + type : "");
}

function showError(prefix, error) {
  // error 객체를 그대로 펼쳐서 보여줍니다. 원인 파악에 도움이 됩니다.
  showStatus(prefix + "\n" + JSON.stringify(error, null, 2), "error");
  console.error(prefix, error);
}


// =====================================================
//  글 목록 그리기
//  JSON 을 그대로 뿌리지 않고, 실제 HTML 요소를 만들어 넣습니다.
// =====================================================
function renderPosts(posts) {
  listEl.innerHTML = "";   // 기존 목록 비우기

  if (posts.length === 0) {
    const li = document.createElement("li");
    li.className = "placeholder";
    li.textContent = "아직 글이 없습니다. 위에서 첫 글을 써보세요.";
    listEl.appendChild(li);
    return;
  }

  posts.forEach(function (post) {
    const li = document.createElement("li");
    li.className = "post-item";

    const h3 = document.createElement("h3");
    h3.className = "post-title";
    // textContent 사용 (innerHTML 아님).
    // 사용자가 입력한 글에 <script> 같은 게 섞여 있어도 태그로 해석되지 않습니다.
    h3.textContent = post.title;
    li.appendChild(h3);

    if (post.content) {
      const p = document.createElement("p");
      p.className = "post-content";
      p.textContent = post.content;
      li.appendChild(p);
    }

    const meta = document.createElement("div");
    meta.className = "post-meta";
    meta.textContent =
      "#" + post.id + " · " + new Date(post.created_at).toLocaleString("ko-KR");
    li.appendChild(meta);

    listEl.appendChild(li);
  });
}


// =====================================================
//  1. 글 목록 불러오기 (SELECT)
// =====================================================
async function loadPosts() {
  refreshBtn.disabled = true;

  const { data, error } = await client
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  refreshBtn.disabled = false;

  if (error) {
    showError("조회 실패", error);
    listEl.innerHTML = "";
    return;
  }

  renderPosts(data);
  showStatus("조회 완료 — " + data.length + "건", "ok");
}


// =====================================================
//  2. 글 저장하기 (INSERT)
// =====================================================
async function addPost(event) {
  // form 의 기본 동작(페이지 새로고침)을 막습니다.
  event.preventDefault();

  const title   = titleEl.value.trim();
  const content = contentEl.value.trim();

  if (!title) {
    showStatus("제목을 입력해주세요.", "error");
    titleEl.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "저장 중…";

  const { error } = await client
    .from("posts")
    .insert([{ title: title, content: content }]);

  submitBtn.disabled = false;
  submitBtn.textContent = "저장하기";

  if (error) {
    showError(
      "저장 실패 — RLS 정책 때문일 가능성이 높습니다.",
      error
    );
    return;
  }

  form.reset();      // 입력칸 비우기
  titleEl.focus();
  showStatus("저장 완료", "ok");
  loadPosts();       // 목록 새로고침
}


// =====================================================
//  이벤트 연결
//  HTML 안에 onclick="..." 을 쓰지 않고 여기서 붙입니다.
//  → 구조(HTML)와 동작(JS)이 섞이지 않습니다.
// =====================================================
form.addEventListener("submit", addPost);
refreshBtn.addEventListener("click", loadPosts);

// 페이지가 열리면 목록을 한 번 불러옵니다.
loadPosts();
