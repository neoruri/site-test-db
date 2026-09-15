-- =====================================================
--  Storage(첨부 파일) 점검
-- =====================================================
--
--  Storage 와 DB 는 별개 시스템입니다.
--  그래서 둘이 어긋날 수 있습니다:
--    - DB 에는 "첨부 있음"인데 파일이 없음
--    - 파일은 있는데 DB 에 기록이 없음 (고아 파일)
--
--  업로드는 성공했는데 INSERT 가 실패하면 고아 파일이 남습니다.
--  트랜잭션으로 묶을 수 없어서 생기는 구조적 한계입니다.
-- =====================================================


-- -----------------------------------------------------
-- 1. 버킷 목록과 공개 여부
-- -----------------------------------------------------
--
-- ⚠️ public = true 인 버킷에 개인정보 파일이 들어 있으면 🚨
--    주소만 알면 누구나 받아갈 수 있습니다.

select id                  as "버킷",
       public              as "공개 여부",
       file_size_limit     as "크기 제한(byte)",
       allowed_mime_types  as "허용 형식",
       created_at          as "생성일"
from storage.buckets;


-- -----------------------------------------------------
-- 2. 저장된 파일 수와 용량
-- -----------------------------------------------------
--
-- metadata 안에 크기 정보가 들어 있습니다.

select bucket_id as "버킷",
       count(*)  as "파일 수",
       pg_size_pretty(sum((metadata->>'size')::bigint)) as "총 용량"
from storage.objects
group by bucket_id;


-- -----------------------------------------------------
-- 3. 고아 파일 — 업로드됐지만 신청과 연결되지 않은 파일
-- -----------------------------------------------------
--
-- 정기적으로 확인하고 정리해야 합니다. 안 그러면 용량만 차지합니다.
-- 🔒 결과에 파일 경로가 나옵니다.

select o.name                                as "파일 경로",
       (o.created_at at time zone 'Asia/Seoul') as "업로드 시각",
       pg_size_pretty((o.metadata->>'size')::bigint) as "크기"
from storage.objects o
left join applications a on a.image_path = o.name
where o.bucket_id = 'applications'
  and a.id is null
order by o.created_at;


-- -----------------------------------------------------
-- 4. 반대 경우 — DB 에는 있는데 파일이 없는 신청
-- -----------------------------------------------------
--
-- 관리자 화면에서 "사진을 불러오지 못했습니다"가 뜨는 경우입니다.
-- 파일이 삭제됐거나 업로드가 중간에 실패한 것입니다.

select a.id         as "신청 번호",
       a.name       as "이름",
       a.image_path as "기록된 경로"
from applications a
left join storage.objects o
       on o.name = a.image_path and o.bucket_id = 'applications'
where a.image_path is not null
  and o.id is null;


-- -----------------------------------------------------
-- 5. 고아 파일 삭제
-- -----------------------------------------------------
--
-- ⚠️ 파일을 영구 삭제합니다. 되돌릴 수 없습니다.
--    반드시 3번으로 목록을 먼저 확인하고 실행하세요.
--
-- 안전을 위해 '하루 이상 지난 것'만 지웁니다.
-- 방금 업로드 중인 파일을 지우지 않기 위해서입니다.

-- delete from storage.objects o
-- where o.bucket_id = 'applications'
--   and o.created_at < now() - interval '1 day'
--   and not exists (
--     select 1 from applications a where a.image_path = o.name
--   );
