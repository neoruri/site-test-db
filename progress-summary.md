# Supabase 학습 진행 요약

> 최종 갱신: 2026-08-19

## 목표
사이트 제작을 위한 DB 학습/테스트. 향후 실제 회원 서비스 예정 (지금은 테스트 단계).
로컬 테스트 경로: `E:\claude\site-test-db`

## 완료한 것

### 1. Supabase 프로젝트 생성
- Organization: neoruri's Org (Free)
- Project name: site-test
- Region: Asia Pacific (ap-northeast-2, Seoul)
- Project ID: elcgktqkecweekkupjqn
- Project URL: https://elcgktqkecweekkupjqn.supabase.co

### 2. 테이블 생성
- 테이블명: `posts`
- 컬럼: `id`(int8, PK, 자동), `created_at`(timestamp, default now()), `title`(text), `content`(text)
- RLS(Row Level Security): 활성화됨

### 3. API 키
- 새 방식 키 체계 사용 중 (Publishable key / Secret key)
- Publishable key(`sb_publishable_...`)를 프론트엔드에서 사용 중 — **공개돼도 되는 키**라 커밋 무방
- ✅ 코드베이스 점검 결과 Secret key는 어느 파일에도 들어있지 않음 (노출 위험 없음)
- 앞으로 Secret key는 절대 프론트엔드/커밋 대상 파일에 넣지 않기 (`.env` + `.gitignore` 사용)

### 4. RLS 정책
- 정책명: "test policy"
- Table: public.posts
- Command: ALL (SELECT/INSERT/UPDATE/DELETE)
- Role: public
- USING: `true`, WITH CHECK: `true`
- ⚠️ 테스트 전용 정책 (모든 사용자 전체 허용). 실제 서비스 전 반드시 세분화 필요

### 5. 프론트엔드 연결 테스트 (완료, 성공)
- 파일: `supabase-test.html`
- 순수 HTML/JS, CDN으로 `@supabase/supabase-js` 로드
- insert(저장), select(조회) 테스트 완료 — 정상 작동 확인됨

### 6. 프로젝트 기본 정리 (2026-08-19)
- `.gitignore` 작성 — `.env`, `node_modules/`, 빌드 산출물, 백업/임시 파일 제외
- `CLAUDE.md` 작성 — 다음 세션에서 배경 재설명 없이 이어가기 위한 컨텍스트 문서
- git 저장소는 초기화돼 있으나 **아직 커밋 0건** (첫 커밋 미실행)

### 7. HTML/CSS/JS 파일 분리 (2026-08-19)
단일 파일 `supabase-test.html` → 역할별 3개 파일로 재구성
- `index.html` — 구조만. `<form>` 사용, 인라인 `onclick`/`style` 제거
- `style.css` — 모양. 다크모드(OS 설정 자동 반영) 포함
- `app.js` — 동작. `addEventListener`로 이벤트 연결, Supabase 설정값 상단 배치
- 글 목록을 `JSON.stringify` 덤프 → 실제 HTML 요소(`<li>`)로 렌더링하도록 변경
- `textContent` 사용으로 입력값이 태그로 해석되지 않도록 처리 (XSS 방지)
- 기존 `supabase-test.html`은 참고용으로 남겨둠 (동작 확인 후 삭제 가능)

## 다음에 진행하고 싶은 것 (미정, 선택)
- [ ] 첫 커밋 실행
- [ ] 글 수정(update)/삭제(delete) 기능 추가 → CRUD 완성
- [ ] 여러 테이블 연결 (foreign key)
- [ ] Next.js로 전환
- [ ] GitHub 저장소 생성 및 푸시
- [ ] Vercel 배포 연동
- [ ] Supabase Auth(회원 로그인) 붙이기
- [ ] RLS 정책을 실제 서비스 수준으로 강화 (현재는 all-access 테스트용)

## 참고 - 향후 계획 (사용자 배경)
- 카페24 기반 몰 시스템(미즈톡톡) 운영 중, 이번 학습은 별도 사이트 신규 구축 목적
- 실제 회원 서비스는 나중에 진행 예정, 지금은 학습/테스트 단계
- 웹/DB 연동은 처음 진행 — 설명은 단계별로 상세히
