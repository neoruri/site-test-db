-- =====================================================
-- 002. applications — 신청 내역 테이블
-- 실행일: 2026-09-14
-- =====================================================
--
-- posts(게시판)와 결정적으로 다른 점:
--   posts        → 글은 누구나 봐도 됨
--   applications → 이름·연락처가 담긴 개인정보. 아무나 보면 안 됨
--
-- 그래서 INSERT 는 열되 SELECT 는 제한합니다.
-- =====================================================

create table applications (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name       text not null,          -- 신청자 이름 (필수)
  phone      text not null,          -- 연락처 (필수)
  message    text,                   -- 신청 사유·메모 (선택)
  status     text not null default '접수'   -- 처리 상태
);

alter table applications enable row level security;


-- -----------------------------------------------------
-- 정책 (RLS)
-- -----------------------------------------------------

-- 고객이 신청해야 하므로 입력은 누구에게나 열어둡니다.
create policy "누구나 신청 가능"
on applications for insert
to anon, authenticated
with check (true);

-- 조회는 로그인한 사람에게만.
-- ⚠️ 이 정책은 나중에 005 에서 더 강하게 교체됩니다.
--    "로그인한 사람"과 "관리자"는 다르기 때문입니다.
create policy "로그인한 사람만 조회"
on applications for select
to authenticated
using (true);


-- -----------------------------------------------------
-- 권한 (GRANT)
-- -----------------------------------------------------
--
-- ⚠️ 처음에 이걸 빠뜨려서 신청이 실패했습니다.
--
--    "permission denied for table applications"
--    → applications 테이블에 대한 권한이 거부되었습니다
--
--    정책만 만들고 GRANT 를 안 주면, 문 앞에서 막혀
--    정책 검사까지 가지도 못합니다.
--
--    대시보드로 만든 테이블(posts)은 GRANT 가 자동으로 붙지만,
--    SQL 로 만든 테이블은 직접 줘야 합니다.

grant insert on applications to anon, authenticated;
grant select on applications to authenticated;
-- update, delete 는 주지 않습니다.


-- =====================================================
-- 배운 것 — 권한은 두 층이다
-- =====================================================
--
--   GRANT  → "이 테이블에 접근할 자격이 있나"   (문 앞)
--   RLS    → "이 행을 볼 수 있나"              (방 안)
--
--   둘 다 열려야 통과합니다. 하나만 열려 있으면 막힙니다.
--
--   막힌 층에 따라 응답이 다릅니다:
--     GRANT 에서 막힘 → 401 permission denied  (테이블 존재가 드러남)
--     RLS 에서 막힘   → 200 [] (빈 목록)        (아무것도 안 흘림)
-- =====================================================
