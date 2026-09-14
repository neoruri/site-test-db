-- =====================================================
-- 001. posts — 게시판 테이블 (초기 학습용)
-- 실행일: 2026-08-19
-- =====================================================
--
-- ⚠️ 이 테이블은 원래 Supabase 대시보드의 Table Editor(표 편집기)로
--    클릭해서 만들었습니다. 아래 SQL 은 같은 결과를 만들기 위해
--    나중에 재구성한 것입니다.
--
--    대시보드로 만들면 GRANT 가 자동으로 붙지만,
--    SQL 로 만들면 직접 줘야 해서 아래에 명시했습니다.
-- =====================================================

create table if not exists posts (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  title      text,
  content    text
);

-- RLS(Row Level Security, 행 단위 보안) 켜기
-- 켜는 순간 모든 접근이 차단되고, 정책을 만들어야 열립니다.
alter table posts enable row level security;


-- -----------------------------------------------------
-- 권한 (GRANT) — "어떤 명령을 쓸 수 있는가" (문 앞)
-- -----------------------------------------------------
grant select on posts to anon, authenticated;
grant insert on posts to anon, authenticated;
-- update, delete 는 일부러 주지 않습니다.


-- -----------------------------------------------------
-- 정책 (RLS) — "어떤 행을 볼 수 있는가" (방 안)
-- -----------------------------------------------------
--
-- 게시판이므로 모든 글이 공개입니다. using (true) = 모든 행 통과.
-- 개인정보가 아니라서 가능한 설정입니다.

create policy "누구나 글 읽기"
on posts for select
to anon, authenticated
using (true);

create policy "누구나 글 쓰기"
on posts for insert
to anon, authenticated
with check (true);

-- UPDATE / DELETE 정책은 만들지 않습니다.
-- RLS 가 켜진 상태에서 정책이 없으면 그 명령은 자동으로 차단됩니다.


-- =====================================================
-- 참고 — 처음에는 이런 정책이 있었습니다
-- =====================================================
--
--   create policy "test policy" on posts
--   for all to public using (true) with check (true);
--
-- 모든 명령을 누구에게나 허용하는 테스트용 정책이었고,
-- 위의 SELECT/INSERT 두 개로 교체하면서 삭제했습니다.
--
-- 배운 것: 정책 여러 개는 OR 로 합쳐집니다.
--         조이려면 느슨한 기존 정책을 먼저 지워야 합니다.
-- =====================================================
