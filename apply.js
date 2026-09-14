// =====================================================
//  Supabase 연결 설정
//  Publishable key 는 브라우저에 노출되어도 되는 키입니다.
//  보호는 RLS(행 단위 보안) 정책이 담당합니다.
// =====================================================
const SUPABASE_URL = "https://elcgktqkecweekkupjqn.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZVqmcmyrOyyzTyKjJgoVag_xsrw1lr2";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// =====================================================
//  HTML 요소 가져오기
// =====================================================
const form      = document.getElementById("apply-form");
const nameEl    = document.getElementById("name");
const phoneEl   = document.getElementById("phone");
const messageEl = document.getElementById("message");
const submitBtn = document.getElementById("submit-btn");
const statusEl  = document.getElementById("status");


// =====================================================
//  상태 메시지 표시
// =====================================================
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "status" + (type ? " " + type : "");
}

function showError(prefix, error) {
  // 학습용이라 error 객체를 그대로 펼쳐서 보여줍니다.
  showStatus(prefix + "\n" + JSON.stringify(error, null, 2), "error");
  console.error(prefix, error);
}


// =====================================================
//  신청 보내기 (INSERT)
//
//  RLS 정책상 INSERT 는 anon(로그인 안 한 방문자)에게도 허용돼 있습니다.
//  반대로 SELECT 는 authenticated(로그인한 사용자)에게만 허용돼 있어서,
//  이 페이지에서는 신청 목록을 조회할 수 없습니다. 의도된 설계입니다.
// =====================================================
async function submitApplication(event) {
  // form 의 기본 동작(페이지 새로고침)을 막습니다.
  event.preventDefault();

  const name    = nameEl.value.trim();
  const phone   = phoneEl.value.trim();
  const message = messageEl.value.trim();

  if (!name) {
    showStatus("이름을 입력해주세요.", "error");
    nameEl.focus();
    return;
  }

  if (!phone) {
    showStatus("연락처를 입력해주세요.", "error");
    phoneEl.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "접수 중…";

  // .select() 를 붙이지 않습니다.
  // 붙이면 저장 직후 그 행을 돌려받으려 하는데,
  // 이 페이지에는 조회 권한이 없어서 실패합니다.
  const { error } = await client
    .from("applications")
    .insert([{ name: name, phone: phone, message: message }]);

  submitBtn.disabled = false;
  submitBtn.textContent = "신청하기";

  if (error) {
    showError("접수 실패", error);
    return;
  }

  form.reset();
  nameEl.focus();
  showStatus("신청이 접수되었습니다. 감사합니다.", "ok");
}


// =====================================================
//  이벤트 연결
//  HTML 에 onclick 을 쓰지 않고 여기서 붙입니다.
// =====================================================
form.addEventListener("submit", submitApplication);
