-- =====================================================
--  신청 내역 조회 · 통계
-- =====================================================
--
--  🔒 아래 쿼리 중 일부는 신청자 이름·연락처를 출력합니다.
--     결과를 캡처하거나 공유하지 마세요.
--     CSV 로 내보낸 경우 db_backup/ 에 두고 git 에 올리지 마세요.
-- =====================================================


-- -----------------------------------------------------
-- 1. 전체 건수
-- -----------------------------------------------------
-- 개인정보가 나오지 않습니다. 가볍게 확인할 때.

select count(*) as "총 신청 건수" from applications;


-- -----------------------------------------------------
-- 2. 상태별 건수
-- -----------------------------------------------------
-- 미처리 건이 쌓이고 있는지 한눈에.

select status as "상태",
       count(*) as "건수"
from applications
group by status
order by count(*) desc;


-- -----------------------------------------------------
-- 3. 일별 신청 건수 (최근 30일)
-- -----------------------------------------------------
-- 이벤트 효과나 유입 추이를 볼 때.
--
-- created_at 은 UTC 기준으로 저장됩니다.
-- at time zone 'Asia/Seoul' 로 한국 시간으로 바꿔서 날짜를 셉니다.
-- 이걸 빼먹으면 자정 전후 건이 엉뚱한 날짜로 집계됩니다.

select (created_at at time zone 'Asia/Seoul')::date as "날짜",
       count(*) as "건수"
from applications
where created_at >= now() - interval '30 days'
group by 1
order by 1 desc;


-- -----------------------------------------------------
-- 4. 미처리 목록  🔒 개인정보 출력
-- -----------------------------------------------------
-- 실제로 처리해야 할 건을 볼 때.

select id                                                as "번호",
       (created_at at time zone 'Asia/Seoul')            as "신청일시",
       name                                              as "이름",
       phone                                             as "연락처",
       message                                           as "내용",
       case when image_path is null then '' else '있음' end as "첨부"
from applications
where status = '접수'
order by created_at;


-- -----------------------------------------------------
-- 5. 오래된 미처리 건  🔒 개인정보 출력
-- -----------------------------------------------------
-- 3일 넘게 방치된 건. 운영에서 가장 먼저 봐야 할 목록입니다.

select id                                     as "번호",
       (created_at at time zone 'Asia/Seoul') as "신청일시",
       name                                   as "이름",
       phone                                  as "연락처",
       now()::date - created_at::date         as "경과일"
from applications
where status = '접수'
  and created_at < now() - interval '3 days'
order by created_at;


-- -----------------------------------------------------
-- 6. 상태 변경
-- -----------------------------------------------------
--
-- ⚠️ 데이터를 수정합니다. 번호를 정확히 확인하고 실행하세요.
--    where 절을 빼면 전체가 바뀝니다.
--
-- 참고: applications 에는 UPDATE 권한이 아무에게도 없습니다.
--       앱에서는 상태를 바꿀 수 없고, 여기(관리자 권한)에서만 가능합니다.
--       관리자 화면에서 상태를 바꾸려면 UPDATE 정책을 따로 만들어야 합니다.

-- update applications set status = '완료' where id = 1;


-- -----------------------------------------------------
-- 7. 중복 연락처 확인  🔒 개인정보 출력
-- -----------------------------------------------------
-- 같은 번호로 여러 번 신청한 경우. 스팸이나 실수 중복을 찾을 때.

select phone    as "연락처",
       count(*) as "신청 횟수",
       min(created_at at time zone 'Asia/Seoul') as "첫 신청",
       max(created_at at time zone 'Asia/Seoul') as "마지막 신청"
from applications
group by phone
having count(*) > 1
order by count(*) desc;
