# 학습 진행 요약

> 최종 갱신: 2026-08-27

---

# 📍 지금 여기

**진행 중:** WSL2에 Ubuntu 설치 완료 → 리눅스 기초 실습 중

**바로 다음 한 걸음:**
- [ ] Ubuntu 터미널에서 `code .` 실행 → VS Code가 `WSL: Ubuntu`로 연결되는지 확인
- [ ] 그다음 **Supabase Auth 실습** 시작 (아래 상세)

**막힌 것:** 없음

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
| `sudo`, `/etc/passwd`, `/etc/shadow` 실습 | ✅ |
| VS Code + WSL 연결 | 🔄 확인 중 |
| `/mnt`로 Windows 파일 접근 | ⬜ |
| 필수 명령 20개 익히기 | ⬜ |
| **VPS 구매 → 실전 세팅** | ⬜ (1~2주 후) |
| 💥 일부러 부수고 복구하기 | ⬜ |

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
| 2026-08-26 | 백엔드 학습 방향 논의 — 언어·OS·아키텍처 |
| 2026-08-26 | `SECURITY.md` 작성, CLAUDE.md에 보안 리뷰 규칙 추가 |
| 2026-08-26 | [서버 구매 판단 기준](https://claude.ai/code/artifact/a4ba1341-7aab-47c6-9d9b-6df190892cd0) 문서 작성 |
| 2026-08-26 | WSL2 + Ubuntu 설치, 리눅스 기초 실습 (권한·sudo·shadow) |
| 2026-08-27 | `docs/glossary.md`·`docs/runbook/` 체계 구축 |

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
