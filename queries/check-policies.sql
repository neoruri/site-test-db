-- =====================================================
--  보안 점검 — 정책과 권한이 의도대로 걸려 있는가
-- =====================================================
--
--  언제 쓰나:
--    - 새 테이블을 만든 뒤
--    - 정책을 바꾼 뒤
--    - 정기 점검 (월 1회 정도)
--
--  ⚠️ SQL Editor 는 관리자 권한이라 RLS 를 우회합니다.
--     "여기서 보이는가"가 아니라 "설정이 맞는가"를 확인하는 용도입니다.
--     실제 차단 여부는 curl 이나 페이지에서 테스트하세요.
-- =====================================================


-- -----------------------------------------------------
-- 1. 테이블별 RLS 활성화 여부
-- -----------------------------------------------------
--
-- rowsecurity 가 false 인 테이블이 있으면 🚨
-- 정책을 아무리 만들어도 적용되지 않습니다.

select schemaname, tablename, rowsecurity as "RLS 켜짐"
from pg_tables
where schemaname = 'public'
order by tablename;


-- -----------------------------------------------------
-- 2. 걸려 있는 정책 전체
-- -----------------------------------------------------
--
-- qual       = using 조건  (이 행을 볼 수 있는가)
-- with_check = with check 조건 (이 값을 써도 되는가)
--
-- 확인 포인트:
--   - 의도하지 않은 정책이 남아 있지 않은가
--   - roles 에 anon 이 들어간 SELECT 정책이 개인정보 테이블에 있지 않은가
--   - using (true) 가 개인정보 테이블에 걸려 있지 않은가

select tablename  as "테이블",
       policyname as "정책명",
       cmd        as "명령",
       roles      as "대상 역할",
       qual       as "using 조건",
       with_check as "with check 조건"
from pg_policies
where schemaname = 'public'
order by tablename, cmd;


-- -----------------------------------------------------
-- 3. 테이블 권한 (GRANT)
-- -----------------------------------------------------
--
-- 정책(RLS)만 보면 절반만 본 것입니다.
-- GRANT 가 없으면 정책 검사까지 가지도 못하고 막힙니다.
--
-- 확인 포인트:
--   - anon 에게 SELECT 가 열린 개인정보 테이블이 있는가 🚨
--   - 주지 않기로 한 UPDATE/DELETE 가 들어가 있지 않은가

select table_name     as "테이블",
       grantee        as "대상",
       privilege_type as "권한"
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;


-- -----------------------------------------------------
-- 4. Storage 정책
-- -----------------------------------------------------
--
-- 파일도 테이블과 같은 방식으로 보호됩니다.
-- storage.objects 는 Supabase 가 파일 목록을 관리하는 테이블입니다.

select policyname as "정책명",
       cmd        as "명령",
       roles      as "대상 역할",
       qual       as "using 조건"
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by cmd;


-- =====================================================
--  기대하는 결과 (2026-09 기준)
-- =====================================================
--
--  RLS 활성화:  posts ✅ / applications ✅ / admins ✅
--
--  정책:
--    posts         SELECT  anon,authenticated  using (true)
--    posts         INSERT  anon,authenticated  with check (true)
--    applications  INSERT  anon,authenticated  with check (true)
--    applications  SELECT  authenticated       exists(admins ... auth.uid())
--    admins        SELECT  authenticated       user_id = auth.uid()
--
--  GRANT:
--    applications  anon           INSERT 만
--    applications  authenticated  INSERT, SELECT
--    admins        authenticated  SELECT 만
--
--  Storage:
--    INSERT  anon,authenticated   (업로드는 누구나)
--    SELECT  authenticated + 관리자 명단 확인
--
--  이 목록과 다르면 의도한 변경인지 확인하세요.
-- =====================================================
