# 학습 진행 요약

> 최종 갱신: 2026-09-07

---

# 📍 지금 여기

**진행 중:** WSL2에 PostgreSQL 직접 설치·계정 권한 실습 완료 (2026-09-14)

```
브라우저 → localhost:8888 → WSL2 → nginx → /var/www/html → Supabase(서울)
                                  └ PostgreSQL 16 (mysite DB) ← 오늘 직접 구축
```

**진행 중 프로젝트: 신청 페이지 + 관리자 조회**
고객이 신청하면 관리자만 내역을 볼 수 있는 마이크로 페이지.
미즈톡톡 체험단·이벤트 신청 페이지와 같은 구조.

```
[누구나] apply.html ──INSERT──> applications 테이블
                                     │ 🔒 SELECT 차단
[관리자]    ???     ──SELECT──X    (로그인 미구현)
```

| 단계 | 상태 |
|---|---|
| 테이블 + RLS 설계 (쓰기만 허용) | ✅ |
| GRANT 부여 (RLS와 짝 맞춤) | ✅ |
| 신청 페이지 (`apply.html` / `apply.js`) | ✅ 배포됨 |
| 전화번호 3중 검증 (JS · HTML · DB CHECK) | ✅ |
| 관리자 계정 생성 (Supabase Auth) | ✅ |
| `admins` 명단 테이블 + 정책 강화 | ✅ |
| 관리자 페이지 (`admin.html` / `admin.js`) | ✅ 배포됨 |
| **💥 인증/인가 분리 검증** | ✅ 명단에서 빼면 로그인해도 안 보임 |
| **이미지 첨부** (Private 버킷 + Signed URL) | ✅ |

**바로 다음 한 걸음 (선택):**
- [ ] 관리자가 상태를 `접수` → `완료`로 바꾸기 (UPDATE 권한 추가)
- [ ] 회원가입 차단 설정 찾아서 끄기 (다층 방어)
- [ ] nginx 로그 읽기 · 💥 일부러 부수고 복구

**막힌 것:** 없음

**⚠️ 알아둘 것**
- nginx는 **8888 포트** 사용 (80·8080~8088은 Windows IIS가 점유)
- Supabase 무료 플랜은 **1주일 미사용 시 자동 일시정지** → 주 1회는 열어볼 것
- 크롬 주소창이 `http://localhost:8888` 을 검색으로 처리함 →
  터미널에서 `explorer.exe http://localhost:8888` 로 여는 것이 확실

**결정 대기 중:**
- 백엔드 언어 — **Node.js(JavaScript)** vs **ASP.NET Core(C#)**
  → 개발자분께 "ASP.NET으로 옮길 의향이 있는지" 확인 필요. 그 답이 선택을 좌우함
- VPS 구매 — 리눅스가 손에 붙은 뒤 (1~2주 후)

---

# 트랙별 진행

## A. Supabase (애플리케이션 보안)

| 단계 | 상태 |
|---|---|
| 프로젝트·테이블 생성 | ✅ |
| 프론트엔드 연결 (insert/select) | ✅ |
| HTML/CSS/JS 파일 분리 | ✅ |
| RLS 정책 세분화 | ✅ |
| GitHub + Vercel 배포 | ✅ |
| **Auth (로그인) 붙이기** | ⬜ **다음** |
| `posts.user_id` 추가 | ⬜ |
| `auth.uid() = user_id` 정책 | ⬜ |
| 💥 일부러 뚫어보기 (IDOR 재현) | ⬜ |

**Auth 실습 순서 (다음에 할 것):**
1. Supabase 대시보드에서 이메일 로그인 활성화 ← 클릭 작업, 안내 필요
2. `posts`에 `user_id` 컬럼 추가
3. RLS(행 단위 보안) 정책에 `auth.uid() = user_id` 적용
4. 조건을 일부러 빼고 남의 글이 나오는지 확인

## B. 리눅스·서버 (인프라 보안)

| 단계 | 상태 |
|---|---|
| WSL2 + Ubuntu 24.04 LTS 설치 | ✅ |
| 폴더 구조 (`/etc`, `/var`, `/mnt`) | ✅ |
| 권한 표기 읽기 (`-rw-r--r--`) | ✅ |
| VS Code + WSL 연결 | ✅ |
| `/mnt`로 Windows 파일 접근 | ✅ |
| **nginx 설치·시작 (`apt`, `systemctl`)** | ✅ |
| **포트 충돌 진단·해결 (8888로 이동)** | ✅ |
| **설정 파일 수정 (`nano`, `nginx -t`)** | ✅ |
| **권한 문제 해결 (`sudo cp`)** | ✅ |
| **내 사이트를 nginx로 서빙** | ✅ **완료** |
| **PostgreSQL 16 직접 설치** | ✅ |
| **DB·앱 전용 계정 생성, 최소 권한 부여** | ✅ |
| **💥 권한 테스트 — UPDATE/DELETE 차단 확인** | ✅ |
| **PostgreSQL 외부 노출 차단 확인** | ✅ |
| 오늘 만든 DB에 RLS 직접 걸어보기 | ⬜ |
| nginx 로그 읽기 (`/var/log/nginx/`) | ⬜ |
| 💥 일부러 부수고 복구하기 | ⬜ |
| **VPS 구매 → 실전 세팅** | ⬜ |

### 직접 만든 DB (WSL 안, 연습용)
| 항목 | 값 |
|---|---|
| DB 이름 | `mysite` |
| 관리자 계정 | `postgres` (peer 인증 — `sudo -u postgres psql`) |
| 앱 전용 계정 | `app_user` (비밀번호 인증) |
| `app_user` 권한 | `CONNECT`, `USAGE ON SCHEMA public`, `SELECT`/`INSERT` on `posts` |
| **일부러 안 준 권한** | `UPDATE`, `DELETE` → 차단 확인됨 |
| 접속 | `psql -h localhost -U app_user -d mysite` |

> **학습 방식 변경(2026-09-02):** 개념부터 가르치는 방식이 흡수가 안 돼서,
> **"무엇을 만든다"는 목표를 정하고 막히는 지점에서 개념을 배우는 방식**으로 전환.
> nginx 실습에서 효과 확인됨 — 포트·권한·설정을 전부 **막혀서** 배웠다.

**VPS 단계에서 할 것:** SSH 키 인증 · 방화벽 · nginx · SSL · 자동 업데이트 ·
백업 후 **실제 복구 테스트** · 방화벽 잘못 설정해서 접속 차단시켜보기

## C. 문서 체계

| 문서 | 용도 | 상태 |
|---|---|---|
| `CLAUDE.md` | Claude 작업 규칙 | ✅ |
| `SECURITY.md` | 보안 체크리스트 | ✅ |
| `docs/glossary.md` | 용어 사전 | ✅ |
| `docs/runbook/` | 장애 대응 기록 | ✅ 1건 |
| **runbook 검색 사이트** | Auth 학습 후 제작 | ⬜ |

**runbook 사이트 계획 (3단계):**
1. ~~마크다운으로 형식 잡기~~ ✅
2. Auth 학습 후 Supabase 테이블로 — 문서 머리말이 그대로 컬럼이 됨
3. 검색 사이트 제작 — **원본은 `docs/runbook/`에 그대로 유지** (사이트가 죽어도 봐야 하므로)

---

# 환경 정보

## Supabase
- Project: `site-test` / ID `elcgktqkecweekkupjqn` / Seoul(ap-northeast-2)
- 테이블 `posts`: `id`, `created_at`, `title`, `content`
- Publishable key 사용 (공개 무방). **Secret key는 저장소에 없음** — 유지할 것

### 현재 RLS 정책
| 정책명 | 명령 | 역할 | 조건 |
|---|---|---|---|
| 누구나 글 읽기 | SELECT | anon, authenticated | `using (true)` |
| 누구나 글 쓰기 | INSERT | anon, authenticated | `with check (true)` |

UPDATE/DELETE는 **정책 없음 → 자동 차단**. Auth 도입 전까지 유지.

## 배포
- GitHub: https://github.com/neoruri/site-test-db (Public, `main`)
- Vercel: https://site-test-db.vercel.app — push 시 자동 재배포
  - `/index.html` — 초기 Supabase 연결 테스트 (게시판형)
  - `/apply.html` — **신청 페이지** (고객용, 로그인 불필요)
  - `/admin.html` — **관리자 페이지** (로그인 + 신청 내역 조회)

## `applications` 테이블 (신청 내역)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | int8 | PK, 자동 증가 |
| `created_at` | timestamptz | 기본값 `now()` |
| `name` | text | 필수 |
| `phone` | text | 필수. **CHECK 제약** `^[0-9]{10,11}$` |
| `message` | text | 선택 |
| `status` | text | 기본값 `접수` |

### 권한 설계 — `posts`와 다른 점
| 명령 | GRANT (문 앞) | RLS 정책 (방 안) |
|---|---|---|
| INSERT | `anon, authenticated` | `with check (true)` |
| **SELECT** | `authenticated` | **`exists (select 1 from admins where user_id = auth.uid())`** |
| UPDATE/DELETE | 없음 | 없음 |

`posts`(게시판)는 SELECT가 `anon`에게도 열려 있지만,
`applications`(신청서)는 **개인정보라 관리자 명단에 있는 계정만** 볼 수 있다.
**두 층이 같은 방향을 봐야 통과한다** — 하나만 열려 있으면 막힌다.

## `admins` 테이블 (관리자 명단)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| `user_id` | uuid | PK, `auth.users(id)` 참조, `on delete cascade` |
| `memo` | text | 메모 |

| 명령 | GRANT | RLS 정책 |
|---|---|---|
| SELECT | `authenticated` | **`user_id = auth.uid()`** — 자기 행만 |

**왜 자기 행만 보게 하나:** `applications` 정책이 `admins`를 읽어야 판단할 수 있는데,
아무 권한도 없으면 **정책이 자기 조건을 확인하지 못해 `permission denied`** 가 난다.
그렇다고 전체를 열면 **누가 관리자인지 노출**된다.
그래서 **문은 열되(GRANT) 자기 행만 보이게(RLS)** 한다.

## Storage — 신청서 첨부 이미지
| 항목 | 값 |
|---|---|
| 버킷 | `applications` (**Private**) |
| 제한 | 5MB · `image/jpeg`, `image/png`, `image/webp` |
| 경로 | `uploads/<무작위 uuid>.<확장자>` |

| 명령 | 정책 |
|---|---|
| INSERT (업로드) | `anon, authenticated` — 누구나 |
| SELECT (조회) | `authenticated` + **관리자 명단 확인** (테이블과 같은 조건) |
| UPDATE/DELETE | 없음 → 차단 |

- 파일명은 **MIME 형식에서 확장자를 정해 새로 짓습니다.** 사용자가 올린 이름을 쓰지 않습니다
- 관리자 화면은 **Signed URL**(1시간짜리 임시 주소)로 이미지를 표시합니다
- ⚠️ 업로드 성공 후 INSERT가 실패하면 **고아 파일**이 남습니다.
  Storage와 DB는 별개 시스템이라 트랜잭션으로 묶을 수 없습니다

**관리자 추가/제거**
```sql
-- 추가
insert into admins (user_id, memo)
select id, '메모' from auth.users where email = '주소@example.com';

-- 제거
delete from admins
where user_id = (select id from auth.users where email = '주소@example.com');
```

## 로컬
- WSL2 Ubuntu 24.04.1 LTS / 사용자 `neoguri` (uid 1000, sudo 그룹)
- Windows 드라이브는 `/mnt/c`, `/mnt/e`로 접근
- ⚠️ systemd와 binfmt 충돌로 `Exec format error` 발생 이력 →
  [runbook](docs/runbook/wsl-interop-exec-format-error.md) 참조

## 운영 중인 실서버 (참고 — 학습 대상 아님)
- 카페24 물리 서버(1U/4BAY), Windows Server 2022, Classic ASP
- 홈페이지·쇼핑몰·CRM 운영 중
- ⚠️ **여기서 실습하지 않는다.** 연습은 WSL2와 별도 VPS에서.

---

# 아키텍처 방향 (합의됨)

```
카페24 쇼핑몰 (유지: 결제·전자상거래법·물류·정산)
      │ API
      ↓
  Supabase (자체 DB: CRM 데이터)
      ↓
   Vercel (자체 화면: CRM, 홈페이지)
```

- **홈페이지** → 이전 대상 1순위 (리스크 낮음)
- **쇼핑몰** → 카페24 유지. 직접 구현은 법규·결제 책임까지 떠안게 됨
- **CRM** → 자체 구축 최적. 내부용이라 리스크 낮음

**학습 단계:** ① 현재 학습 → ② 내부용 작은 도구(runbook 사이트) → ③ 홈페이지 이전 → ④ CRM

---

# 완료 이력

| 날짜 | 내용 |
|---|---|
| 2026-08-19 | Supabase 프로젝트·테이블 생성, 프론트 연결 테스트 성공 |
| 2026-08-19 | `.gitignore`·`CLAUDE.md` 작성, HTML/CSS/JS 3파일 분리 |
| 2026-08-19 | RLS 정책 세분화 (ALL 전체허용 → SELECT/INSERT만) |
| 2026-08-19 | GitHub 저장소 생성, Vercel 배포, 모바일 확인 |
| 2026-08-26 | 백엔드 학습 방향 논의 — 언어·OS·아키텍처. `SECURITY.md` + 보안 리뷰 규칙 |
| 2026-08-26 | [서버 구매 판단 기준](https://claude.ai/code/artifact/a4ba1341-7aab-47c6-9d9b-6df190892cd0) 문서 작성 |
| 2026-08-27 | WSL2 + Ubuntu 24.04 설치, 리눅스 기초 실습 (폴더 구조·권한·`sudo`) |
| 2026-08-31 | `docs/runbook/` 체계, `docs/glossary.md`, `docs/linux-cheatsheet.md` 작성 |
| 2026-09-02 | **학습 방식 전환** (개념 중심 → 목표 중심). nginx 설치, 포트 충돌 해결(8888) |
| 2026-09-07 | 내 사이트를 nginx로 서빙 성공. Supabase 정지 발견·복구. runbook 3건 축적 |
| 2026-09-14 | **PostgreSQL 16 직접 설치.** DB·앱 전용 계정 생성, 최소 권한 부여, 차단 확인 |
| 2026-09-14 | **신청 페이지 + 관리자 페이지 완성.** Auth 로그인, `admins` 명단 기반 RLS, 인증/인가 분리 검증 |

---

# 배운 것 (원리 — 환경이 바뀌어도 유효)

- **RLS는 정책이 없으면 차단된다.** 금지 정책을 쓰는 게 아니라, 안 만들면 막힌다
- **정책 여러 개는 OR로 합쳐진다.** 조이려면 느슨한 기존 정책을 먼저 지워야 한다
- **인증(누구인가)과 인가(권한이 있는가)는 다르다.** 사고 1위가 인가 누락
- **RLS는 인가를 DB가 강제한다** → API마다 검사를 짜는 방식과 달리 빠뜨릴 수 없다
- 리눅스 오류 메시지 구분: `No such file`(없음) / `Permission denied`(권한) / `Exec format error`(실행법 모름)
- **"고쳤다"와 "고쳐진 걸 확인했다"는 다르다.** 조치 후 실제 동작을 테스트할 것
- 진단 순서는 어떤 장애든 같다: 증상 → 메시지 해석 → 상태 조회 → 원인 추정 → 조치 → **검증**
- **해본 적 없는 백업은 백업이 아니다**
- **`GRANT`와 RLS는 층이 다르다** — `GRANT`는 **테이블 단위**("이 표에 접근 가능한가"),
  RLS는 **행 단위**("이 줄을 볼 수 있는가"). `GRANT`만으로는 "본인 글만 수정"이 불가능하다
- **관리자 계정은 RLS를 무시한다** (`Bypass RLS`) — Supabase Secret key와 같은 성격.
  그래서 **앱은 반드시 전용 계정**으로 연결한다
- SQL 오류도 두 종류를 구분한다: `syntax error`(내가 잘못 씀) / `permission denied`(막힌 것)
- 프롬프트가 위치를 알려준다: `$`=리눅스 명령 · `=#`=SQL(관리자) · `=>`=SQL(일반) · `->`=입력 미완
- **GRANT와 RLS는 둘 다 열려야 통과한다.** GRANT에서 막히면 `401 permission denied`,
  RLS에서 막히면 `200 []`(빈 목록). RLS 쪽이 정보를 덜 흘리고, GRANT 쪽이 더 엄격하다
- **SQL로 만든 테이블은 GRANT를 직접 해줘야 한다.** 대시보드로 만들면 자동으로 붙는다
- **입력 검증은 세 겹이고, 앞의 두 겹은 전부 우회 가능하다**
  JS 필터·HTML `pattern`은 브라우저 안의 일이라 지울 수 있다. **DB CHECK만이 진짜 방어다**
- **구조와 데이터는 별개다.** `CREATE TABLE`은 한 번뿐이고, 이후 변경은 `ALTER`(구조)와
  `UPDATE`(데이터)로 나눠서 한다. 기존 데이터가 새 규칙을 위반하면 규칙 추가가 실패한다
- **인증과 인가는 실제로 분리되어 작동한다.** 로그인 상태를 그대로 둔 채 `admins` 명단에서
  행 하나만 지우면 데이터가 안 보인다. 코드는 한 줄도 바뀌지 않는다.
  → "로그인했다"와 "권한이 있다"는 다른 말이다
- **정책 조건 안의 조회도 권한 검사를 받는다.** 정책이 다른 테이블을 참조하면
  그 테이블에도 접근 권한이 있어야 한다. 없으면 정책이 판단 자체를 못 해서 오류가 난다
- **오류 메시지로 정보를 흘리지 않는다.** 로그인 실패 시 "그런 이메일 없음"이라고 답하면
  어떤 계정이 존재하는지 알려주는 셈이다. "이메일 또는 비밀번호가 올바르지 않습니다"로 뭉뚱그린다
- **화면을 감추는 건 보안이 아니다.** 개발자도구로 `hidden`을 지우면 영역이 드러나지만
  내용은 비어 있다. 데이터를 막는 건 화면이 아니라 RLS다
- **파일도 RLS로 보호된다.** `storage.objects`도 결국 테이블이라 정책을 그대로 건다.
  테이블과 **같은 조건**을 써야 한다 — 목록은 막히는데 첨부는 보이면 의미가 없다
- **"보기"와 "다운로드"는 웹에서 같은 동작이다.** 화면에 보인다는 건 이미 전송됐다는 뜻.
  보여주되 못 받게 하는 것은 불가능하다
- **Signed URL은 주소 자체가 열쇠다.** 유효기간 안에는 로그인 없이도 열린다.
  민감한 파일일수록 기간을 짧게 잡고, 메신저로 전달하지 않는다
- **업로드 파일명은 서버가 정한다.** 사용자 이름을 그대로 쓰면 덮어쓰기·경로 조작이 생긴다.
  확장자도 파일명이 아니라 **MIME 형식에서** 가져온다
