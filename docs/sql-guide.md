# SQL 명령어 설명서

> **"이 명령은 언제 쓰고, 어떻게 쓰는가"**
>
> - 지금까지 **쓴 쿼리** → [`../queries/`](../queries/) · [`../db/`](../db/)
> - **명령어 자체의 뜻** → 이 문서
> - 리눅스 명령 → [`linux-cheatsheet.md`](linux-cheatsheet.md)
>
> 예시는 **이 프로젝트의 실제 테이블**로 썼습니다. 그대로 실행해볼 수 있습니다.

## 예시에 나오는 테이블

| 테이블 | 내용 | 주요 컬럼 |
|---|---|---|
| `posts` | 연습용 게시판 | `id`, `created_at`, `title`, `content` |
| `applications` | 🔒 신청 내역 (개인정보) | `id`, `created_at`, `name`, `phone`, `message`, `status`, `image_path` |
| `admins` | 관리자 명단 | `user_id`, `memo` |

## 실행 위치

> 🗄️ **Supabase SQL Editor** — 웹 화면. **관리자 권한이라 RLS를 무시합니다**
> 🗄️ **psql 안** (`mysite=#`) — WSL의 로컬 PostgreSQL
> 📁 **리눅스 프롬프트** (`neoguri@...:~$`) — 여기서는 SQL이 안 통합니다

⚠️ **SQL Editor에서 보인다고 앱에서도 보이는 게 아닙니다.** 관리자 권한이라 정책을 통과해버립니다.
실제 차단 여부는 `curl` 이나 페이지에서 확인하세요.

---

# 1. SQL 문장의 구조

SQL은 **영어 문장**에 가깝습니다. 순서가 정해져 있습니다.

```sql
select  name, phone          -- 무엇을      (가져올 컬럼)
from    applications         -- 어디서      (테이블)
where   status = '접수'       -- 어떤 것만   (조건)
order by created_at desc     -- 어떤 순서로
limit   10;                  -- 몇 개만
```

> **`;` 로 문장이 끝납니다.** 빼먹으면 psql이 계속 입력을 기다립니다 (프롬프트가 `->` 로 바뀜).

## 명령 지도 — 크게 네 갈래

| 갈래 | 명령 | 무엇을 건드리나 | 위험도 |
|---|---|---|---|
| **조회** | `select` | 아무것도 안 바꿈 | 🟢 안전 |
| **데이터** | `insert` · `update` · `delete` | 내용이 바뀜 | 🔴 되돌리기 어려움 |
| **구조** | `create` · `alter` · `drop` | 틀이 바뀜 | 🔴 `drop`은 특히 |
| **권한** | `grant` · `revoke` · `policy` | 누가 뭘 할 수 있나 | 🔴 보안 직결 |

> **조회는 아무리 해도 안전합니다.** 막히면 `select` 로 먼저 확인하는 습관이 최고의 방어입니다.

---

# 2. `SELECT` — 조회

## 언제 쓰나

- 데이터가 **들어갔는지 확인**할 때
- 건수·통계를 낼 때
- 🔴 **`update`·`delete` 하기 전에, 대상이 맞는지 확인할 때** ← 가장 중요한 용도

## 기본형

```sql
select * from applications;
```

`*` 는 **모든 컬럼**입니다. 빠르지만 🔒 **개인정보까지 전부 나옵니다.**
필요한 것만 고르는 습관을 들이세요.

```sql
select id, name, status from applications;
```

## 예시 ① — 조건 걸기 (`where`)

```sql
select id, name, phone
from applications
where status = '접수';
```

**조건에 쓰는 연산자**

| 쓰는 법 | 뜻 | 예 |
|---|---|---|
| `=` | 같다 | `status = '접수'` |
| `<>` 또는 `!=` | 다르다 | `status <> '완료'` |
| `>` `<` `>=` `<=` | 크다/작다 | `id >= 10` |
| `like` | 포함 (`%`=아무 글자) | `name like '김%'` — 김씨 |
| `in` | 여럿 중 하나 | `status in ('접수','보류')` |
| `is null` | 비어 있다 | `image_path is null` |
| `is not null` | 값이 있다 | `image_path is not null` |
| `and` / `or` | 그리고 / 또는 | `status='접수' and id>5` |
| `between` | 범위 | `id between 1 and 10` |

> ⚠️ **문자는 작은따옴표 `'`**, 숫자는 그냥 씁니다. 큰따옴표 `"` 는 **컬럼 이름용**이라 다릅니다.
> `where name = "홍길동"` → `column "홍길동" does not exist` 오류가 납니다.

> ⚠️ **빈 값은 `= null` 로 못 찾습니다.** 반드시 `is null`. (null은 "없음"이라 비교가 성립 안 함)

## 예시 ② — 정렬과 개수 제한

```sql
select id, name, created_at
from applications
order by created_at desc   -- desc=내림차순(최신 먼저), asc=오름차순
limit 10;                  -- 10개만
```

> **`limit` 을 붙이는 습관**을 들이세요. 데이터가 많아지면 전부 불러오느라 느려집니다.

## 예시 ③ — 건수 세기

```sql
select count(*) from applications;                      -- 전체
select count(*) from applications where status = '접수'; -- 조건부
```

`count(*)` 는 **행의 개수**입니다. 개인정보가 안 나와서 가볍게 확인할 때 좋습니다.

## 예시 ④ — 묶어서 세기 (`group by`)

```sql
select status, count(*)
from applications
group by status;
```

```
 status | count
--------+-------
 접수   |    12
 완료   |     5
```

> **`group by` 는 "같은 값끼리 묶어서 한 줄로"** 입니다.
> 묶고 나면 개별 행은 사라지므로, `select` 에는 **묶은 기준**과 **집계 함수**만 올 수 있습니다.

**집계 함수**: `count()` 개수 · `sum()` 합 · `avg()` 평균 · `max()`/`min()` 최대/최소

## 예시 ⑤ — 날짜별 집계 (시간대 주의)

```sql
select (created_at at time zone 'Asia/Seoul')::date as 날짜,
       count(*)
from applications
where created_at >= now() - interval '30 days'
group by 1
order by 1 desc;
```

> 🔴 **`at time zone 'Asia/Seoul'` 을 빼면 안 됩니다.**
> DB는 시간을 **UTC(세계 표준시)** 로 저장합니다. 한국은 +9시간이라,
> 변환 없이 날짜를 세면 **밤 9시 이후 신청이 다음 날로 집계**됩니다.

`::date` 는 **형변환**입니다. 시각에서 날짜만 떼어냅니다.
`group by 1` 은 "첫 번째 컬럼 기준으로 묶어라"는 뜻입니다.

## 예시 ⑥ — 두 테이블 합치기 (`join`)

`admins` 에는 계정 id만 있고 이메일이 없습니다. `auth.users` 와 이어야 보입니다.

```sql
select u.email, a.memo
from admins a
join auth.users u on u.id = a.user_id;
```

**`on` 은 "무엇을 기준으로 이을지"** 입니다. 여기서는 `user_id` 와 `id` 가 같은 행끼리 잇습니다.
`a`, `u` 는 **별명**입니다. 길게 쓰지 않으려고 붙입니다.

| 종류 | 뜻 |
|---|---|
| `join` (= inner join) | **양쪽에 다 있는 것만** |
| `left join` | **왼쪽은 다 나오고**, 오른쪽은 있으면 붙임 |

## 예시 ⑦ — `left join` 으로 "없는 것" 찾기

고아 파일(업로드됐지만 신청과 연결 안 된 파일) 찾기:

```sql
select o.name
from storage.objects o
left join applications a on a.image_path = o.name
where o.bucket_id = 'applications'
  and a.id is null;          -- ← 짝이 없는 것만
```

> **`left join` + `is null` 은 "짝이 없는 행 찾기" 공식**입니다. 자주 씁니다.

---

# 3. `INSERT` — 넣기

## 언제 쓰나

새 데이터를 추가할 때. 앱에서 자동으로 일어나고, **수동으로는 관리자 등록 정도**에 씁니다.

```sql
insert into posts (title, content)
values ('제목', '내용');
```

> **컬럼 이름을 적는 방식을 쓰세요.** 생략하면 컬럼 순서에 의존해서, 나중에 컬럼이 추가되면 깨집니다.
> `id` 나 `created_at` 처럼 **기본값이 있는 컬럼은 빼면 자동으로 채워집니다.**

## 예시 — 여러 건 한 번에

```sql
insert into posts (title, content) values
  ('첫 글', '내용1'),
  ('둘째 글', '내용2');
```

## 예시 — 조회 결과를 그대로 넣기

관리자 등록에 쓴 방식입니다. **긴 uuid를 손으로 옮기지 않아도 됩니다.**

```sql
insert into admins (user_id, memo)
select id, '메모'
from auth.users
where email = '주소@example.com';
```

> `values` 자리에 `select` 가 들어간 형태입니다. **"조회한 결과를 그대로 넣어라".**

---

# 4. `UPDATE` — 고치기 🔴

## 언제 쓰나

기존 행의 값을 바꿀 때. 상태 변경(`접수`→`완료`), 데이터 정리 등.

```sql
update applications
set status = '완료'
where id = 1;
```

> 🔴 **`where` 를 빼면 전체가 바뀝니다.** 되돌릴 수 없습니다.
>
> ```sql
> update applications set status = '완료';   -- 💥 전부 완료로 바뀜
> ```

## 🔴 안전 습관 — 반드시 `select` 로 먼저

```sql
-- ① 먼저 확인: 몇 건이 걸리는가
select count(*) from applications where id = 1;

-- ② 건수가 예상과 같으면 실행
update applications set status = '완료' where id = 1;
```

**`where` 절을 그대로 복사해서** `select` 에 붙여보는 것이 요령입니다.
1건일 줄 알았는데 200건이 나오면, 거기서 멈추면 됩니다.

## 예시 — 데이터 정리

전화번호에서 숫자만 남기기 (CHECK 제약을 걸기 전에 했던 작업):

```sql
update applications
set phone = regexp_replace(phone, '[^0-9]', '', 'g');
```

`regexp_replace(대상, 바꿀패턴, 바꿀값, 'g')` — `[^0-9]` 는 **숫자가 아닌 것**, `'g'` 는 **전부**.

---

# 5. `DELETE` — 지우기 🔴

```sql
delete from applications where id = 1;
```

> 🔴 **`where` 없는 `delete` 는 테이블을 비웁니다.**
> `update` 보다 위험합니다. `update`는 값이 바뀔 뿐이지만 **`delete`는 행이 사라집니다.**

**순서를 지키세요.**

```sql
select * from applications where id = 1;   -- ① 이것이 맞나 눈으로 확인
delete from applications where id = 1;     -- ② 같은 where 로 실행
```

> ⚠️ 대량 삭제 전에는 **백업을 먼저** 받으세요. → [`disaster-recovery.md`](disaster-recovery.md)

---

# 6. 구조를 다루는 명령

## `CREATE TABLE` — 테이블 만들기

```sql
create table applications (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name       text not null,
  phone      text not null,
  message    text,
  status     text not null default '접수'
);
```

| 부분 | 뜻 |
|---|---|
| `primary key` | 이 행을 가리키는 **고유 번호**. 중복 불가 |
| `generated always as identity` | 번호를 **자동으로 매김** |
| `not null` | 🔴 **비워둘 수 없음** — 필수 입력 |
| `default now()` | 안 넣으면 **현재 시각** |
| `timestamptz` | 시간대 정보가 붙은 시각 (UTC 저장) |

**자주 쓰는 타입**

| 타입 | 용도 |
|---|---|
| `text` | 글자 (길이 제한 없음) |
| `bigint` | 정수 |
| `boolean` | 참/거짓 |
| `timestamptz` | 시각 |
| `uuid` | 무작위 고유 id |
| `jsonb` | JSON 데이터 |

> 🔴 **테이블을 만들면 RLS를 즉시 켭니다.** 세트로 기억하세요.
> ```sql
> alter table applications enable row level security;
> ```

## `ALTER TABLE` — 구조 바꾸기

```sql
alter table applications add column image_path text;          -- 컬럼 추가
alter table applications add constraint phone_digits          -- 규칙 추가
  check (phone ~ '^[0-9]{10,11}$');
```

`~` 는 **정규식 일치**입니다. `^[0-9]{10,11}$` = "처음부터 끝까지 숫자 10~11자".

> ⚠️ **기존 데이터가 규칙을 위반하면 규칙 추가가 실패합니다.**
> **데이터 정리(`update`) → 규칙 추가(`alter`)** 순서입니다.

> **구조(`alter`)와 데이터(`update`)는 다른 작업입니다.** 헷갈리면 막힙니다.

## `DROP` — 없애기 🔴

```sql
drop table 이름;      -- 💥 테이블과 데이터가 통째로 사라짐
drop policy "정책명" on 테이블;
```

> 🔴 **`drop table` 은 되돌릴 수 없습니다.** 백업에서 복구하는 것 외에 방법이 없습니다.
> 실무에서는 **이름을 바꿔두고 한동안 지켜보는** 방식을 씁니다.
> ```sql
> alter table 이름 rename to 이름_old_20260915;
> ```

---

# 7. 권한 — `GRANT` 와 `POLICY`

**층이 다릅니다. 둘 다 열려야 통과합니다.**

```
요청 → [ GRANT : 이 표에 접근 가능? ] → [ POLICY : 이 줄을 볼 수 있나? ] → 결과
        문 앞 · 테이블 단위              방 안 · 행 단위
```

## `GRANT` / `REVOKE`

```sql
grant insert on applications to anon, authenticated;
grant select on applications to authenticated;

revoke update on applications from authenticated;   -- 회수
```

| 역할 | 누구 |
|---|---|
| `anon` | **로그인 안 한 사람** (익명) |
| `authenticated` | **로그인한 사람** |

> 🔴 **SQL로 만든 테이블은 GRANT가 자동으로 안 붙습니다.** (대시보드로 만들면 붙음)
> 빠뜨리면 `permission denied for table ...` 이 납니다.

## `CREATE POLICY` — 행 단위 규칙

```sql
create policy "관리자만 조회" on applications
  for select
  to authenticated
  using ( exists (select 1 from admins where user_id = auth.uid()) );
```

| 부분 | 뜻 |
|---|---|
| `for select` | 어떤 명령에 적용할지 (`select`/`insert`/`update`/`delete`/`all`) |
| `to authenticated` | 누구에게 |
| `using (...)` | **이 행을 볼 수 있는가** (select/update/delete) |
| `with check (...)` | **이 값을 써도 되는가** (insert/update) |

**`auth.uid()`** — 로그인한 사람의 계정 id를 돌려주는 **Supabase 제공 함수**입니다.
(표준 PostgreSQL에는 없습니다.) 로그인 안 했으면 `null` 입니다.

**`exists (select 1 from ...)`** — "이런 행이 **있는가**"만 판단합니다.
`select 1` 의 `1` 은 아무 의미 없는 값입니다. **존재 여부만 보므로 무엇을 고르든 상관없습니다.**

### 🔴 정책의 세 가지 함정

| | |
|---|---|
| **정책은 허용만 쓴다** | "금지 정책"은 없다. **안 만드는 것 = 막는 것** |
| **여러 개는 OR로 합쳐진다** | 조이려면 **느슨한 기존 정책을 먼저 `drop`** |
| **정책 안의 조회도 권한 검사를 받는다** | 참조하는 테이블에도 `grant` 가 필요 |

---

# 8. 자주 쓰는 표현

| 표현 | 뜻 | 예 |
|---|---|---|
| `now()` | 현재 시각 | `where created_at > now() - interval '7 days'` |
| `interval '3 days'` | 기간 | `'1 hour'`, `'30 days'` |
| `at time zone 'Asia/Seoul'` | 한국 시간으로 변환 | 🔴 날짜 집계에 필수 |
| `::date`, `::int` | 형변환 | `created_at::date` |
| `coalesce(a, b)` | a가 비었으면 b | `coalesce(memo, '없음')` |
| `case when ... then ... else ... end` | 조건부 값 | 아래 |
| `as` | 별명 붙이기 | `count(*) as "건수"` |
| `distinct` | 중복 제거 | `select distinct status from ...` |
| `having` | **묶은 뒤**의 조건 | 아래 |

```sql
-- case: 첨부 여부를 보기 좋게
select name,
       case when image_path is null then '' else '있음' end as "첨부"
from applications;

-- having: 2번 이상 신청한 번호 (group by 결과에 조건)
select phone, count(*)
from applications
group by phone
having count(*) > 1;
```

> **`where` 와 `having` 의 차이** — `where` 는 **묶기 전** 개별 행에, `having` 은 **묶은 뒤** 결과에 겁니다.

---

# 9. 🔴 실행 전 습관

**이 네 가지만 지키면 큰 사고는 안 납니다.**

```
① update·delete 는 select 로 먼저 확인      ← 같은 where 를 복사해서
② where 없는 update·delete 는 일단 멈춘다
③ 대량 변경 전에는 백업
④ SQL Editor 는 관리자 권한 — "여기서 보인다"가 "앱에서 보인다"는 아니다
```

그리고 **실행한 SQL은 `db/` 에 남깁니다.**

> 🔴 **Supabase 웹에서 실행한 SQL은 아무 데도 기록되지 않습니다.**
> `db/0NN_이름.sql` 이 **유일한 이력**입니다. 이게 있어야 나중에 같은 구조를 재현할 수 있습니다.

---

# 10. 오류 메시지 읽기

| 메시지 | 우리말 | 원인 |
|---|---|---|
| `syntax error at or near "..."` | 문법 오류 | **내가 잘못 씀** — 오타·`,` 빠짐·따옴표 |
| `relation "xxx" does not exist` | 그런 테이블이 없음 | 이름 오타, 또는 아직 안 만듦 |
| `column "xxx" does not exist` | 그런 컬럼이 없음 | 오타, 또는 **문자에 큰따옴표를 씀** |
| `permission denied for table xxx` | 권한 없음 | **GRANT 누락** |
| `new row violates check constraint` | 값 규칙 위반 | CHECK에 걸림 — **정상 동작** |
| `duplicate key value violates unique constraint` | 중복 | 이미 있는 값 |
| `violates foreign key constraint` | 참조 위반 | 연결된 행이 없음 |
| `null value in column "xxx" violates not-null` | 필수값 누락 | `not null` 컬럼을 비움 |
| `invalid input syntax for type uuid` | uuid 형식 아님 | uuid 자리에 문자열을 넣음 |

> **오류는 두 종류입니다.**
> `syntax error` = **내가 잘못 쓴 것** (고치면 됨)
> `permission denied` · `violates ...` = **막힌 것** (의도한 방어일 수 있음 — 확인부터)

---

# 11. 확인용 쿼리 모음

> 🗄️ **SQL Editor** — 전부 조회만 합니다. 🟢 안전

```sql
-- 어떤 테이블이 있나 + RLS 켜졌나
select tablename, rowsecurity from pg_tables where schemaname = 'public';

-- 이 테이블의 컬럼 구조
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'applications';

-- 걸려 있는 정책
select tablename, policyname, cmd, roles, qual
from pg_policies where schemaname = 'public';

-- 누구에게 어떤 권한이 있나
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon','authenticated');
```

**더 자세한 점검용 쿼리는** [`../queries/check-policies.sql`](../queries/check-policies.sql) **에 있습니다.**
