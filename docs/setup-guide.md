# 새 프로젝트 처음부터 끝까지

> **이 문서는 "백엔드 프로젝트를 0부터 어떤 순서로 세우는가"입니다.**
>
> - 프로젝트 **전체** 세우는 순서 → **이 문서**
> - 기능 **하나** 만드는 순서 → [`workflow.md`](workflow.md)
> - 실서비스에 뭐가 더 필요한가 → [`feature-map.md`](feature-map.md)
>
> 이 저장소를 실제로 만든 순서 그대로입니다.
> **다만 "이렇게 했어야 했다"로 고쳐 적었습니다** — 실제로는 몇 개를 뒤늦게 했고,
> 그래서 사고가 날 뻔했습니다. 그 지점을 ⚠️ 로 표시해뒀습니다.

## 중요도 표기

| 표기 | 뜻 |
|---|---|
| 🔴 | **빠뜨리면 사고** — 개인정보 유출·데이터 손실 |
| 🟡 | **빠뜨리면 나중에 비쌈** — 되돌리기 어려움 |
| 🟢 | 나중에 해도 됨 |

---

# 0단계 — 만들기 전에 정할 것 🟡

코드보다 먼저 정합니다. **나중에 바꾸면 비싼 것들**입니다.

| 정할 것 | 왜 먼저인가 |
|---|---|
| **어떤 데이터를 다루나** | 개인정보가 있으면 설계가 통째로 달라진다 |
| **누가 쓰나** | 누구나 / 로그인 / 관리자만 — 권한 설계의 출발점 |
| **리전(지역)** | 나중에 못 바꾼다. 한국 사용자면 **Seoul** |
| 서비스명·저장소명 | |

> 🔴 **개인정보가 들어가는가?** — 이름·연락처·주소·건강정보 중 하나라도 있으면
> 이후 모든 단계에서 기본값이 "막고 시작"입니다. 게시판처럼 열어두면 안 됩니다.

---

# 1단계 — Supabase 프로젝트 생성 🔴

**클릭 작업** (Claude가 대신 못 함)

```
supabase.com → New project
  ├ Name         : 프로젝트 이름
  ├ Database Password : 🔴 생성 후 다시 볼 수 없음 → 즉시 안전한 곳에 보관
  └ Region       : Northeast Asia (Seoul)   ← 나중에 변경 불가
```

### 🔴 여기서 놓치기 쉬운 것 — 키 두 종류를 구분하지 않는 것

`Project Settings → API Keys` 에 키가 두 개 있습니다. **성격이 정반대입니다.**

| 키 | 성격 | 어디에 |
|---|---|---|
| **Publishable** (`sb_publishable_...`) | 공개돼도 됨. 보호는 RLS가 담당 | 브라우저 코드에 넣어도 됨, 커밋 OK |
| **Secret** (`sb_secret_...`) | 🔴 **RLS를 통째로 무시** | 서버에서만. **커밋·채팅·화면 공유 금지** |

> Secret 키가 유출되면 **정책을 아무리 잘 짜도 전부 무의미합니다.** 관리자 권한으로 다 열립니다.

### DB 비밀번호 보관

> 🔴 생성 화면을 닫으면 다시 볼 수 없습니다. 분실하면 재설정해야 합니다.
> ⚠️ **메모장·카톡·이메일에 두지 마세요.** 비밀번호 관리자나 잠긴 파일에.

---

# 2단계 — 저장소(GitHub) 🔴 **`.gitignore` 를 첫 커밋보다 먼저**

> ⚠️ **실제로 여기서 사고가 날 뻔했습니다.**
> `db_backup/` 폴더가 `.gitignore` 에 없는 상태였고, `git add -A` 를 한 번만 했으면
> **신청자 이름·연락처가 공개 저장소에 올라갔을 것**입니다.

**순서를 반드시 지킵니다.**

```
① .gitignore 작성      ← 파일을 만들기 전에
② git init
③ 첫 커밋
④ GitHub 저장소 생성 · push
```

### 처음부터 넣어야 할 `.gitignore`

```gitignore
# 비밀 값
.env
.env.*
!.env.example

# DB 백업 — 개인정보 포함, 절대 금지
db_backup/
*.csv
*.sql.gz
*.dump
!db/*.sql          # 단, 마이그레이션(구조)은 올린다

# 빌드·의존성·로그
node_modules/
dist/
.vercel/
*.log
```

> 🔴 **Git은 지워도 과거 커밋에 남습니다.**
> 한 번 올라간 개인정보는 `git rm` 으로 지워도 이력에 그대로 있고,
> 누가 복제(clone)해 갔다면 **회수할 수 없습니다.** 애초에 들어가지 않게 막는 것이 유일한 방법입니다.

**기준: 설계도는 공개, 내용물은 비공개.**
`db/*.sql`(테이블 구조)는 올리고, `*.sql.gz`(실제 데이터)는 올리지 않습니다.

### Public 으로 할 것인가 🟡

| | Public | Private |
|---|---|---|
| 학습·테스트 | ✅ 무방 | |
| **실서비스** | | ✅ **이쪽** |

키·설정·폴더 구조가 다 보입니다. 학습용이면 상관없지만 **실서비스는 Private** 으로 시작하세요.
나중에 바꿀 수는 있지만, 그때는 **이미 공개된 이력이 남습니다.**

---

# 3단계 — 배포 연결 (Vercel) 🟢

```
vercel.com → Add New Project → GitHub 저장소 선택 → Deploy
```

빌드 도구가 없는 순수 HTML이면 설정할 게 없습니다. 이후 **`git push` = 자동 배포**입니다.

> 🟡 **이 순간부터 push가 곧 공개입니다.** 로컬에서만 도는 코드가 아닙니다.
> 확인하지 않은 코드를 push하지 마세요.

---

# 4단계 — 테이블 만들기 + RLS 즉시 켜기 🔴

**테이블 생성과 RLS 활성화는 한 세트입니다.** 나눠서 하면 그 사이에 구멍이 생깁니다.

> 🗄️ **Supabase SQL Editor**

```sql
create table applications (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name       text not null,
  phone      text not null,
  message    text,
  status     text not null default '접수'
);

alter table applications enable row level security;   -- 🔴 같이 실행
```

### 🔴 놓치기 쉬운 것 ① — RLS를 안 켜면 정책이 무의미

RLS가 꺼져 있으면 **정책을 아무리 만들어도 적용되지 않습니다.** 조용히 다 열립니다.
확인:

```sql
select tablename, rowsecurity from pg_tables where schemaname = 'public';
```

`rowsecurity = false` 인 테이블이 있으면 🚨

### 🔴 놓치기 쉬운 것 ② — SQL로 만든 테이블은 GRANT가 자동으로 안 붙는다

> ⚠️ **실제로 여기서 막혔습니다.** `permission denied for table applications`

| 만든 방법 | GRANT |
|---|---|
| 대시보드 Table Editor | **자동으로 붙음** |
| **SQL Editor 에서 `create table`** | **안 붙음 → 직접 줘야 함** |

그래서 5단계가 따로 있습니다.

---

# 5단계 — GRANT (테이블 단위 권한) 🔴

```sql
grant insert on applications to anon, authenticated;
grant select on applications to authenticated;
-- update, delete 는 일부러 주지 않는다
```

> **안 주는 걸 적어두는 게 설계입니다.** 필요해지면 그때 추가합니다.

### GRANT와 RLS는 층이 다릅니다

```
요청 → [ GRANT : 이 표에 접근 가능? ] → [ RLS : 이 줄을 볼 수 있나? ] → 결과
         문 앞 (테이블 단위)              방 안 (행 단위)
```

**둘 다 열려야 통과합니다.** 어디서 막혔는지는 응답으로 구분합니다.

| 응답 | 막힌 곳 |
|---|---|
| `401 permission denied` | GRANT |
| `200 []` (빈 목록) | RLS — 정보를 덜 흘림 |

---

# 6단계 — 정책(Policy) 만들기 🔴

```sql
-- 누구나 신청은 할 수 있게
create policy "누구나 신청" on applications
  for insert to anon, authenticated with check (true);

-- 조회는 관리자만
create policy "관리자만 조회" on applications
  for select to authenticated
  using ( exists (select 1 from admins where user_id = auth.uid()) );
```

### 🔴 놓치기 쉬운 것 ③ — 정책은 OR로 합쳐진다

> ⚠️ **실제로 겪었습니다.** 처음에 `for all using (true)` 정책을 만들어뒀더니,
> 아무리 엄격한 정책을 새로 추가해도 **느슨한 쪽이 계속 통과시켰습니다.**

**조이려면 기존 정책을 먼저 지워야 합니다.**

```sql
drop policy "기존 느슨한 정책" on applications;
```

| 기억할 것 | |
|---|---|
| 정책은 **허용만** 쓴다 | "금지 정책"이라는 건 없다 |
| 정책이 **없으면 차단** | 안 만드는 것 = 막는 것 |
| 여러 개는 **OR** | 하나라도 통과시키면 통과 |

### 🔴 놓치기 쉬운 것 ④ — 정책 안의 조회도 권한 검사를 받는다

> ⚠️ **실제로 막혔습니다.** `permission denied for table admins`

위 정책은 `admins` 테이블을 읽습니다. 그런데 `admins` 에 권한이 없으면
**정책이 자기 조건을 판단조차 못 해서 오류가 납니다.**

그렇다고 전체를 열면 **누가 관리자인지 노출**됩니다. 그래서:

```sql
grant select on admins to authenticated;              -- 문은 열되
create policy "본인 여부만 확인" on admins             -- 자기 행만 보이게
  for select to authenticated using ( user_id = auth.uid() );
```

---

# 7단계 — 값 검증 (CHECK 제약) 🔴

```sql
alter table applications
  add constraint phone_digits check (phone ~ '^[0-9]{10,11}$');
```

### 검증은 세 겹인데, 앞의 두 겹은 전부 우회됩니다

| 층 | 위치 | 성격 |
|---|---|---|
| JS 필터 | 브라우저 | 편의. 개발자도구로 지울 수 있음 |
| HTML `pattern` | 브라우저 | 편의. 마찬가지 |
| **DB `CHECK`** | **서버** | 🔴 **진짜 방어. 이것만 못 뚫음** |

브라우저를 빼고 `curl` 로 직접 쏘면 앞의 두 개는 **존재하지도 않습니다.**

### 🟡 놓치기 쉬운 것 ⑤ — 기존 데이터가 규칙을 위반하면 추가가 실패한다

> ⚠️ 이미 `010-1234-5678` 처럼 하이픈이 든 데이터가 있으면 위 `alter` 가 실패합니다.

**데이터를 먼저 정리하고, 그다음 규칙을 겁니다.**

```sql
update applications set phone = regexp_replace(phone, '[^0-9]', '', 'g');  -- ① 정리
alter table applications add constraint ... ;                              -- ② 규칙
```

> **구조(ALTER)와 데이터(UPDATE)는 다른 작업입니다.** 순서를 헷갈리면 막힙니다.

---

# 8단계 — 💥 공격해보기 🔴 **화면을 만들기 전에**

> **여기를 건너뛰면 "잘 되네" 하고 넘어가게 됩니다.** 방어는 뚫어봐야 확인됩니다.

> 📁 **리눅스 프롬프트** — 브라우저의 검증을 전부 우회해 API를 직접 두드립니다.

```bash
# 읽기가 막히나
curl "$URL/rest/v1/applications?select=*" -H "apikey: $KEY"

# 잘못된 값이 막히나
curl -X POST "$URL/rest/v1/applications" -H "apikey: $KEY" \
  -H "Content-Type: application/json" -d '{"name":"x","phone":"abc"}'
```

| 기대 | |
|---|---|
| 조회 | `401` 또는 `200 []` |
| 잘못된 전화번호 | `400 violates check constraint` |
| 정상 신청 | `201` |

---

# 9단계 — 화면 만들기 🟢

| 파일 | 역할 |
|---|---|
| `*.html` | 구조만. `onclick=` · `style=` 인라인 금지 |
| `style.css` | 모양 |
| `*.js` | 동작. `addEventListener` 로 연결 |

### 🟡 놓치기 쉬운 것 ⑥ — 페이지에 필요 없는 권한을 쓰는 것

신청 페이지는 **쓰기만** 합니다. 그래서 `.insert()` 뒤에 `.select()` 를 붙이지 않습니다.
붙이면 조회 권한이 필요해지고, 그 권한을 열어주는 순간 **다른 사람 신청서도 보입니다.**

### 🟡 놓치기 쉬운 것 ⑦ — 화면을 감추는 건 보안이 아니다

개발자도구로 `hidden` 을 지우면 관리자 영역이 **드러납니다.**
드러나도 **내용이 비어 있어야** 합니다. 그건 화면이 아니라 RLS가 하는 일입니다.

---

# 10단계 — 로그인(Auth)과 관리자 🔴

```
Authentication → Users → Add user   (Auto Confirm User 체크)
```

그다음 **관리자 명단 테이블**을 따로 둡니다.

```sql
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  memo    text
);
alter table admins enable row level security;
```

> **왜 명단을 따로 두나** — "로그인했다"와 "권한이 있다"는 다른 말이기 때문입니다.
> 로그인만으로 권한을 주면, 계정이 하나 생기는 순간 전부 열립니다.

### 🔴 놓치기 쉬운 것 ⑧ — 회원가입이 열려 있는 것

기본값은 **누구나 가입 가능**입니다. 관리자용 프로젝트라면 꺼야 합니다.
(명단 방식이라 가입해도 데이터는 안 보이지만, **층을 하나 더 두는 게 맞습니다.**)

정기 확인:

```sql
select u.email, case when a.user_id is null then '' else '관리자' end
from auth.users u left join admins a on a.user_id = u.id;
```

**모르는 계정이 있으면 🚨**

### 🔴 놓치기 쉬운 것 ⑨ — 오류 메시지가 정보를 흘리는 것

| | |
|---|---|
| ❌ "등록되지 않은 이메일입니다" | **어떤 계정이 존재하는지 알려주는 셈** |
| ✅ "이메일 또는 비밀번호가 올바르지 않습니다" | 어느 쪽이 틀렸는지 모름 |

### 인증과 인가를 확인하는 법 💥

로그인한 상태 그대로 `admins` 에서 본인 행을 지우고 새로고침 → **목록이 빕니다.**
코드는 한 줄도 안 바뀝니다.

```
인증(Authentication) = 누구인가        → 그대로
인가(Authorization)  = 무엇을 할 수 있나 → 사라짐
```

---

# 11단계 — 파일 첨부(Storage) 🟡

```
Storage → New bucket → 🔴 Private 으로   (Public 으로 만들면 주소만 알면 누구나 받음)
  ├ 크기 제한 : 5MB
  └ 허용 형식 : image/jpeg, image/png, image/webp
```

### 🔴 놓치기 쉬운 것 ⑩ — Storage 정책을 테이블과 다르게 거는 것

`storage.objects` 도 결국 **테이블**입니다. 정책을 그대로 겁니다.
**테이블과 같은 조건**이어야 합니다 — 목록은 막히는데 첨부 이미지는 보이면 의미가 없습니다.

### 🟡 놓치기 쉬운 것 ⑪ — 업로드 파일명을 사용자가 정하게 두는 것

```js
const EXT = { "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp" };
const path = "uploads/" + crypto.randomUUID() + "." + EXT[file.type];
```

**확장자도 파일명이 아니라 MIME 형식에서 가져옵니다.**
사용자 이름을 그대로 쓰면 덮어쓰기·경로 조작이 생깁니다.

### 🟡 놓치기 쉬운 것 ⑫ — 고아 파일

업로드는 성공했는데 INSERT가 실패하면 **파일만 남습니다.**
Storage와 DB는 별개 시스템이라 **트랜잭션으로 묶을 수 없습니다.** 구조적 한계입니다.
→ 정기적으로 [`queries/storage-check.sql`](../queries/storage-check.sql) 로 확인·정리.

### Signed URL

비공개 파일은 **1시간짜리 임시 주소**로 보여줍니다.

> ⚠️ **주소 자체가 열쇠입니다.** 유효기간 안에는 로그인 없이도 열립니다.
> 민감할수록 기간을 짧게, **메신저로 전달하지 않습니다.**

---

# 12단계 — 기록 남기기 🟡 **매 SQL마다**

> 🔴 **Supabase 웹 화면에서 실행한 SQL은 아무 데도 기록되지 않습니다.**
> 이 파일들이 **유일한 이력**입니다.

```
db/001_posts.sql
db/002_applications.sql
db/003_applications_phone_check.sql
...
```

| 규칙 | |
|---|---|
| 번호순으로 쌓는다 | |
| **이미 만든 파일은 고치지 않는다** | 변경은 **새 번호**로 추가 |
| SQL만이 아니라 **왜 그렇게 했는지와 막힌 지점**도 주석으로 | 몇 달 뒤의 나를 위해 |

> 이게 있으면 **새 프로젝트에 순서대로 실행하는 것만으로 같은 구조가 재현**됩니다.

---

# 13단계 — 백업 🔴 **나중이 아니라 지금**

> ⚠️ **실제로는 이걸 맨 마지막에 했습니다. 순서가 틀렸습니다.**
> 데이터가 쌓이기 시작한 날이 백업이 필요해진 날입니다.

| 확인 | |
|---|---|
| Supabase 무료 플랜 자동 백업 | **7일치뿐** |
| 🔴 무료 플랜은 **1주일 미사용 시 자동 정지** | 주 1회는 열어볼 것 |

### 백업 스크립트가 해야 할 일

```
pg_dump → 🔴 결과 검증 → 압축 → 권한 600 → 오래된 것 정리
```

> **검증 단계가 핵심입니다.** 실패해도 파일은 생깁니다. **0바이트짜리 백업**이 쌓여 있다가
> 정작 필요할 때 아무것도 없는 게 가장 흔한 사고입니다.

```bash
[ "$(stat -c%s "$FILE")" -lt 1000 ] && { rm -f "$FILE"; exit 1; }
grep -q "CREATE TABLE" "$FILE" || { rm -f "$FILE"; exit 1; }
```

### 🔴 놓치기 쉬운 것 ⑬ — `.env` 의 특수문자

> ⚠️ **실제로 여기서 한참 헤맸습니다.** `password authentication failed` 가 반복됐는데,
> 원인은 비밀번호에 `$` 가 들어 있어서 **bash가 변수로 해석해 잘라먹은 것**이었습니다.

```bash
PGPASSWORD='따옴표로 감싼다'      # ✅
PGPASSWORD=abc$def123            # ❌ $def 가 사라짐
```

### 🔴 놓치기 쉬운 것 ⑭ — `pg_dump` 버전

> ⚠️ `aborting because of server version mismatch`
> **도구가 서버보다 낮으면 안 됩니다.** 서버가 17이면 클라이언트도 17 이상.

### 🔴 놓치기 쉬운 것 ⑮ — 같은 PC 안의 백업은 절반짜리

PC가 고장나면 **원본과 백업이 같이** 사라집니다.
**사본 3개 · 매체 2종 · 외부 1곳.** 클라우드에 올릴 거면 **암호를 걸고** 올립니다.

### 🔴 그리고 — 💥 복구 테스트

> **해본 적 없는 백업은 백업이 아닙니다.**

⚠️ 반드시 **빈 DB**에 복구합니다. 실제 DB에 하면 덮어씁니다.

```
gzip -t 파일 → createdb restore_test → 복구 → 건수 확인 → dropdb restore_test
```

---

# 14단계 — 점검 체계 🟢

| 주기 | 할 일 |
|---|---|
| 주 1회 | Supabase 열어보기 (정지 방지) · 백업 파일 생성·크기 확인 |
| 월 1회 | [`queries/check-policies.sql`](../queries/check-policies.sql) — 정책·권한이 의도대로인가 |
| 월 1회 | 고아 파일 · 모르는 계정 |
| 분기 1회 | 💥 복구 테스트 |

**30분 이상 막혔던 것은 [`runbook/`](runbook/) 에 남깁니다.** 며칠 뒤면 잊고 같은 곳에서 또 막힙니다.

---

# 전체 체크리스트 (복사해서 쓰세요)

```
[ ] 0.  다루는 데이터에 개인정보가 있는지 판단        🔴
[ ] 1.  Supabase 프로젝트 (리전=Seoul, DB 비번 보관)  🔴
[ ] 1-2 키 두 종류 구분 — Secret 은 절대 커밋 금지     🔴
[ ] 2.  .gitignore 를 첫 커밋보다 먼저                🔴
[ ] 2-2 실서비스면 저장소 Private                     🟡
[ ] 3.  Vercel 연결 (이후 push = 공개)                🟢
[ ] 4.  테이블 생성 + RLS 즉시 활성화                 🔴
[ ] 5.  GRANT — SQL로 만들면 자동으로 안 붙음          🔴
[ ] 6.  정책 — 느슨한 기존 정책 먼저 삭제              🔴
[ ] 6-2 정책이 참조하는 테이블에도 권한 필요           🔴
[ ] 7.  CHECK 제약 (데이터 정리 → 규칙 추가 순서)      🔴
[ ] 8.  💥 curl 로 공격 — 화면 만들기 전에             🔴
[ ] 9.  화면 (필요한 권한만 사용)                     🟢
[ ] 10. Auth + 관리자 명단, 회원가입 차단             🔴
[ ] 10-2 로그인 오류 메시지 뭉뚱그리기                 🔴
[ ] 11. Storage — Private, 테이블과 같은 조건          🟡
[ ] 11-2 파일명은 서버가 생성 (MIME 기준 확장자)       🟡
[ ] 12. db/ 에 마이그레이션 기록 (웹 SQL은 안 남음)    🟡
[ ] 13. 백업 + 검증 + 외부 보관                       🔴
[ ] 13-2 💥 복구 테스트                               🔴
[ ] 14. 정기 점검 주기 정하기                         🟢
```

---

# 실제로 순서를 틀렸던 것

**다음에는 이 셋을 앞으로 당깁니다.**

| 무엇 | 실제로 한 시점 | 했어야 할 시점 |
|---|---|---|
| `.gitignore` 에 `db_backup/` | 사고 직전에 발견 | **2단계, 첫 커밋 전** |
| 백업 | 거의 마지막 | **데이터가 쌓이기 시작한 날** |
| 복구 테스트 | **아직 안 함** | 백업을 만든 날 |
