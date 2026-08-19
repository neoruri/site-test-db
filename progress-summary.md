# Supabase 학습 진행 요약

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
- Publishable key(`sb_publishable_...`)를 프론트엔드에서 사용 중
- ⚠️ Secret key는 브라우저에 노출되어 재발급 권장한 이력 있음 — 재발급 여부 확인 필요

### 4. RLS 정책
- 정책명: "test policy"
- Table: public.posts
- Command: ALL (SELECT/INSERT/UPDATE/DELETE)
- Role: public
- USING: `true`, WITH CHECK: `true`
- ⚠️ 테스트 전용 정책 (모든 사용자 전체 허용). 실제 서비스 전 반드시 세분화 필요

### 5. 프론트엔드 연결 테스트 (완료, 성공)
- 파일: `E:\claude\site-test-db\supabase-test.html`
- 순수 HTML/JS, CDN으로 `@supabase/supabase-js` 로드
- insert(저장), select(조회) 테스트 완료 — 정상 작동 확인됨

## 다음에 진행하고 싶은 것 (미정, 선택)
- 글 수정/삭제 기능 추가
- 여러 테이블 연결 (foreign key)
- Next.js로 전환
- GitHub 저장소 생성 및 커밋
- Vercel 배포 연동
- RLS 정책을 실제 서비스 수준으로 강화 (현재는 all-access 테스트용)

## 참고 - 향후 계획 (사용자 배경)
- 카페24 기반 몰 시스템(미즈톡톡) 운영 중, 이번 학습은 별도 사이트 신규 구축 목적
- 실제 회원 서비스는 나중에 진행 예정, 지금은 학습/테스트 단계
