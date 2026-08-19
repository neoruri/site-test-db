# CLAUDE.md

이 파일은 이 저장소에서 작업하는 Claude Code에게 주는 안내입니다.

## 프로젝트 개요

웹사이트 ↔ 서버 DB(Supabase) 연동을 배우기 위한 **학습/테스트용 저장소**입니다.
제품 코드가 아니라 실험장입니다. 여기서 검증한 패턴을 나중에 실제 사이트로 옮길 예정입니다.

- 사용자는 웹/DB 연동이 **처음**입니다. 설명은 단계별로, 용어를 풀어서 해주세요.
- 진행 이력과 다음 할 일은 `progress-summary.md`에 있습니다. **작업 후 이 파일을 갱신하세요.**

## 기술 스택

| 항목 | 내용 |
|---|---|
| DB / 백엔드 | Supabase (PostgreSQL + REST API + RLS) |
| 프론트엔드 | 순수 HTML + JavaScript, 빌드 도구 없음 |
| 라이브러리 로드 | CDN (`@supabase/supabase-js@2` UMD 빌드) |
| 리전 | ap-northeast-2 (Seoul) |
| 저장소 | https://github.com/neoruri/site-test-db (Public, 기본 브랜치 `main`) |
| 배포 | https://site-test-db.vercel.app — `git push` 시 자동 재배포 |

⚠️ **이미 공개 배포된 사이트입니다.** 로컬에서만 도는 코드가 아니므로, 변경을 push하기 전에 동작을 확인하세요.

빌드 단계도 패키지 매니저도 없습니다. **HTML 파일을 브라우저로 직접 열면 실행됩니다.**

## 파일 구조

```
site-test-db/
├── index.html           # 구조(마크업)만
├── style.css            # 모양
├── app.js               # 동작 + Supabase 설정값
├── supabase-test.html   # 초기 단일파일 버전 (참고용, 위 3개로 대체됨)
├── progress-summary.md  # 진행 상황 + 다음 할 일 목록
├── CLAUDE.md            # 이 파일
└── .gitignore
```

**역할 분리 원칙** — 마크업은 `index.html`, 스타일은 `style.css`, 로직은 `app.js`에 둡니다.
HTML에 `onclick="..."`이나 `style="..."`을 인라인으로 넣지 마세요. 이벤트는 `app.js`에서 `addEventListener`로 연결합니다.

`app.js`는 **일반 스크립트**입니다. `type="module"`로 바꾸면 `file://`에서 CORS로 막혀 실행이 안 됩니다. 모듈이 필요해지는 시점이 곧 로컬 서버(또는 Next.js)로 넘어갈 시점입니다.

## 실행 방법

```bash
start index.html
```

또는 탐색기에서 `index.html`을 더블클릭. 빌드도 서버도 불필요.

## 데이터베이스

### `posts` 테이블
| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | int8 | PK, 자동 증가 |
| `created_at` | timestamptz | 기본값 `now()` |
| `title` | text | |
| `content` | text | |

### RLS (Row Level Security)
활성화되어 있습니다. **RLS가 켜진 상태에서 매칭되는 정책이 없으면 그 명령은 차단됩니다.**
→ insert/select가 안 될 때는 거의 항상 RLS 정책 문제입니다.

현재 정책:

| 정책명 | 명령 | 역할 | 조건 |
|---|---|---|---|
| 누구나 글 읽기 | SELECT | anon, authenticated | `using (true)` |
| 누구나 글 쓰기 | INSERT | anon, authenticated | `with check (true)` |

**UPDATE / DELETE 정책은 일부러 없습니다.** 정책이 없으므로 자동 차단됩니다.
수정·삭제 기능을 붙이면 실패하는 것이 정상입니다. Auth 도입 전에는 이 상태를 유지하세요.

정책을 다룰 때 기억할 것:
- 정책은 **허용만** 작성합니다. "금지" 정책이라는 건 없습니다.
- 정책 여러 개는 **OR로 합쳐집니다.** 조이려면 느슨한 기존 정책을 먼저 지워야 합니다.
- `using` = 이 행을 볼 수 있는가 (SELECT/UPDATE/DELETE)
- `with check` = 이 값을 써도 되는가 (INSERT/UPDATE)

Auth 도입 후 목표: `posts.user_id`를 추가하고 `auth.uid() = user_id` 조건으로 본인 글만 수정·삭제.

## 키 취급 규칙 — 중요

Supabase의 **새 키 체계**를 씁니다. 둘을 반드시 구분하세요.

- **Publishable key** (`sb_publishable_...`) — 브라우저에 노출되는 게 정상입니다.
  HTML에 하드코딩되어 있어도 되고, 커밋해도 됩니다. 보호는 RLS가 담당합니다.
- **Secret key** (`sb_secret_...`) — RLS를 **우회**합니다.
  프론트엔드 코드, 커밋되는 파일, 대화 로그 어디에도 넣지 마세요.
  서버 사이드에서만 쓰고 `.env`로 관리합니다 (`.env`는 `.gitignore`에 등록됨).

현재 저장소에 Secret key는 없습니다. 이 상태를 유지하세요.

## 작업 시 지침

- **Supabase 대시보드 작업**(테이블 생성, 정책 추가, 키 발급)은 Claude가 대신 할 수 없습니다.
  클릭 경로를 순서대로 안내하고, 사용자가 마쳤는지 확인한 뒤 다음 단계로 가세요.
- 새 기능은 `supabase-test.html` 안에 작은 단위로 추가하고, 매번 브라우저에서 동작을 확인한 뒤 다음으로 넘어갑니다.
- 에러가 나면 `error` 객체를 그대로 화면에 출력하는 현재 방식을 유지하세요. 학습에 도움이 됩니다.
- 커밋은 사용자가 요청할 때만 하세요. GitHub 저장소 생성/푸시도 마찬가지입니다.
