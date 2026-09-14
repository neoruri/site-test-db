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
const imageEl   = document.getElementById("image");
const submitBtn = document.getElementById("submit-btn");
const statusEl  = document.getElementById("status");


// =====================================================
//  첨부 파일 제한
//
//  ⚠️ 여기 검사는 '편의'입니다. 개발자도구로 지우면 통과합니다.
//     진짜 방어는 버킷에 걸어둔 크기·MIME 제한입니다.
//     (전화번호 검증과 같은 구조 — 앞의 겹은 친절함, 서버 쪽이 방어)
// =====================================================
const BUCKET = "applications";
const MAX_SIZE = 5 * 1024 * 1024;   // 5MB

// 확장자를 파일 이름에서 가져오지 않고 MIME 형식에서 정합니다.
// 사용자가 'evil.php' 를 올려도 이름을 그대로 쓰지 않기 위해서입니다.
const EXT_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp"
};


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

  const file = imageEl.files[0];   // 선택 안 했으면 undefined

  // ---- 첨부 파일 검사 (편의) ----
  if (file) {
    if (!EXT_BY_TYPE[file.type]) {
      showStatus("JPG, PNG, WEBP 이미지만 첨부할 수 있습니다.", "error");
      return;
    }
    if (file.size > MAX_SIZE) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      showStatus("파일이 너무 큽니다 (" + mb + "MB). 5MB 이하만 가능합니다.", "error");
      return;
    }
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "접수 중…";

  // ---- ① 파일이 있으면 먼저 업로드 ----
  //
  // 순서가 중요합니다. 업로드가 실패하면 신청 자체를 중단합니다.
  // 반대로 하면 '첨부가 있다고 기록됐는데 파일은 없는' 상태가 생깁니다.
  let imagePath = null;

  if (file) {
    submitBtn.textContent = "사진 올리는 중…";

    // 파일 이름은 서버(우리)가 정합니다. 사용자가 올린 이름을 그대로 쓰면
    //   - 같은 이름끼리 덮어쓰기
    //   - 경로 조작 시도 (../)
    //   - 한글·특수문자 문제
    // 가 생깁니다. 무작위 이름을 새로 지어 붙입니다.
    const ext  = EXT_BY_TYPE[file.type];
    const path = "uploads/" + crypto.randomUUID() + "." + ext;

    const up = await client.storage.from(BUCKET).upload(path, file);

    if (up.error) {
      submitBtn.disabled = false;
      submitBtn.textContent = "신청하기";
      showError("사진 업로드 실패", up.error);
      return;
    }

    imagePath = path;
  }

  // ---- ② 신청 내용 저장 ----
  //
  // .select() 를 붙이지 않습니다.
  // 붙이면 저장 직후 그 행을 돌려받으려 하는데,
  // 이 페이지에는 조회 권한이 없어서 실패합니다.
  submitBtn.textContent = "접수 중…";

  const { error } = await client
    .from("applications")
    .insert([{
      name:       name,
      phone:      phone,
      message:    message,
      image_path: imagePath
    }]);

  submitBtn.disabled = false;
  submitBtn.textContent = "신청하기";

  if (error) {
    // ⚠️ 알려진 한계:
    //    파일은 이미 올라갔는데 여기서 실패하면 주인 없는 파일이 남습니다.
    //    Storage 와 DB 는 별개 시스템이라 '둘 다 성공 아니면 둘 다 취소'로
    //    묶을 수 없습니다(트랜잭션이 걸리지 않음).
    //    실무에서는 주기적으로 고아 파일을 정리하는 작업을 따로 둡니다.
    showError("접수 실패", error);
    return;
  }

  form.reset();
  nameEl.focus();
  showStatus("신청이 접수되었습니다. 감사합니다.", "ok");
}


// =====================================================
//  연락처 입력칸 — 숫자만 남기기 (사용자 편의)
//
//  HTML 의 pattern 속성은 "제출할 때"만 검사합니다.
//  그러면 다 치고 나서야 틀렸다는 걸 알게 되어 불편합니다.
//  그래서 타이핑하는 순간 숫자가 아닌 문자를 지웁니다.
//
//  ⚠️ 이건 어디까지나 '편의'입니다. 보안이 아닙니다.
//     개발자도구로 이 코드를 지우거나, HTML 을 거치지 않고
//     API 를 직접 호출하면 그대로 통과합니다.
//     진짜 방어는 DB 의 CHECK 제약이 담당합니다.
// =====================================================
phoneEl.addEventListener("input", function () {
  const digitsOnly = phoneEl.value.replace(/[^0-9]/g, "");
  if (phoneEl.value !== digitsOnly) {
    phoneEl.value = digitsOnly;
  }
});


// =====================================================
//  이벤트 연결
//  HTML 에 onclick 을 쓰지 않고 여기서 붙입니다.
// =====================================================
form.addEventListener("submit", submitApplication);
