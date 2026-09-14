# DB 마이그레이션

지금까지 Supabase에서 실행한 SQL을 **순서대로** 모아둔 곳입니다.

## 왜 필요한가

Supabase 웹 화면(SQL Editor, Table Editor)에서 실행한 SQL은 **아무 데도 남지 않습니다.**
그러면 이런 상황에서 막힙니다.

| 상황 | 기록이 없으면 | 기록이 있으면 |
|---|---|---|
| 프로젝트를 새로 만들어야 할 때 | 처음부터 다시 클릭·입력 | 순서대로 실행하면 끝 |
| "정책을 언제 왜 바꿨더라" | 알 수 없음 | 파일을 보면 됨 |
| 개발용/운영용 DB를 맞출 때 | 수작업 | 같은 파일 실행 |
| 실수로 뭔가 지웠을 때 | 복구 불가 | 다시 만들 수 있음 |

**마이그레이션**(migration) = DB 구조 변경을 단계별로 기록해 순서대로 적용하는 방식.

## 규칙

1. **파일은 번호 순서대로** 실행합니다. 번호는 실제로 실행한 순서입니다.
2. **이미 만든 파일은 고치지 않습니다.** 변경이 필요하면 **새 번호로 파일을 추가**합니다.
   → 그래야 "언제 무엇이 바뀌었는지"가 이력으로 남습니다.
3. 앞으로 SQL을 실행할 때마다 **여기에 파일을 추가**합니다.

> 2번이 중요합니다. `005`에서 `002`의 정책을 지우고 새로 만드는 게 낭비처럼 보이지만,
> **그게 실제로 일어난 일**입니다. 이력을 고치면 기록의 의미가 사라집니다.

## 파일 목록

| 번호 | 내용 |
|---|---|
| `001_posts.sql` | 게시판 테이블 (초기 학습용) |
| `002_applications.sql` | 신청 테이블 + 정책 + GRANT |
| `003_applications_phone_check.sql` | 전화번호 형식 제약 |
| `004_admins.sql` | 관리자 명단 테이블 |
| `005_applications_admin_only.sql` | 조회 조건을 "로그인" → "관리자 명단" 으로 강화 |

## 새 프로젝트에 적용하려면

Supabase → SQL Editor 에서 `001`부터 순서대로 실행합니다.

⚠️ `004` 이후를 쓰려면 **관리자 계정이 먼저 필요합니다.**
Authentication → Users → Add user 로 계정을 만든 뒤,
`004` 마지막의 등록 SQL에서 이메일을 바꿔 실행하세요.

## 확인 명령

현재 걸려 있는 정책 보기:
```sql
select tablename, policyname, cmd, roles, qual
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

현재 부여된 권한 보기:
```sql
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
order by table_name, grantee;
```
