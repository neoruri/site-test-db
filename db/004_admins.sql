-- =====================================================
-- 004. admins — 관리자 명단
-- 실행일: 2026-09-14
-- =====================================================
--
-- 왜 필요한가:
--
--   002 의 조회 정책은 "to authenticated" — 로그인한 사람이면 통과였습니다.
--   그런데 Supabase 는 기본적으로 누구나 회원가입할 수 있습니다.
--
--     아무나 가입 → 로그인 → authenticated → 신청 내역 전부 조회
--
--   "로그인한 사람"과 "관리자"는 다릅니다.
--   이 구분을 안 하는 것이 백엔드 사고 1위입니다 (인증은 했는데 인가를 빠뜨림).
--
--   그래서 '누가 관리자인지' 적어두는 명단을 따로 만듭니다.
-- =====================================================

create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  memo    text
);

alter table admins enable row level security;

-- uuid                        = 계정마다 부여되는 고유 식별자
-- references auth.users(id)   = Supabase 가 관리하는 계정 테이블과 연결.
--                               존재하지 않는 계정은 넣을 수 없습니다.
-- on delete cascade           = 계정이 삭제되면 이 명단에서도 자동으로 빠집니다.
-- primary key                 = 같은 계정을 두 번 등록할 수 없습니다.


-- -----------------------------------------------------
-- 권한과 정책 — "자기 행만" 보이게
-- -----------------------------------------------------
--
-- ⚠️ 처음에는 GRANT 도 정책도 안 만들었습니다. 그랬더니 이런 오류가 났습니다:
--
--      "permission denied for table admins"
--
--    005 의 정책이 조건을 판단하려면 admins 를 읽어야 하는데,
--    읽을 권한이 없어서 정책이 자기 조건을 확인하지 못한 것입니다.
--
--    → 정책 조건 안의 조회도 권한 검사를 받습니다.
--
--    그렇다고 전체를 열면 "누가 관리자인지" 가 노출됩니다.
--    그래서 문은 열되(GRANT) 자기 행만 보이게(RLS) 합니다.

grant select on admins to authenticated;

create policy "본인의 관리자 여부만 확인"
on admins for select
to authenticated
using ( user_id = auth.uid() );

-- 결과:
--   관리자 본인                → 자기 행 1개가 보임  → exists = 참
--   관리자 아닌 로그인 사용자  → 빈 결과            → exists = 거짓
--   로그인 안 한 사람          → 접근 불가
--
--   누구도 관리자 명단 전체를 볼 수 없습니다.
--   각자 "나는 관리자인가?" 만 확인할 수 있습니다.
--
-- INSERT / UPDATE / DELETE 는 GRANT 도 정책도 없습니다.
-- 관리자 추가·제거는 Supabase 대시보드(관리자 권한)에서만 가능합니다.


-- =====================================================
-- 관리자 등록 / 제거
-- =====================================================
--
-- ⚠️ 먼저 Authentication → Users → Add user 로 계정을 만들어야 합니다.
--    (Auto Confirm User 체크 — 이메일 인증 절차를 건너뜁니다)
--
-- 아래 이메일 주소를 실제 값으로 바꿔서 실행하세요.
-- insert ... select 방식이라 긴 uuid 를 손으로 옮길 필요가 없습니다.

-- 등록
--   insert into admins (user_id, memo)
--   select id, '최초 관리자'
--   from auth.users
--   where email = '주소@example.com';

-- 제거
--   delete from admins
--   where user_id = (select id from auth.users where email = '주소@example.com');

-- 확인
--   select a.memo, u.email, u.created_at
--   from admins a
--   join auth.users u on u.id = a.user_id;
