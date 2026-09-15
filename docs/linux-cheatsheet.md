# 리눅스 치트시트

**며칠 만에 돌아왔을 때 이 문서부터 보세요.** 외우지 말고 찾아 쓰면 됩니다.

상황별로 묶었습니다. "지금 뭘 하고 싶은가"로 찾으세요.

---

## 기본 감각 — 이것만은 기억

| 개념 | 내용 |
|---|---|
| 드라이브가 없다 | `C:\` `E:\` 같은 게 없음. **`/` 하나가 뿌리**고 전부 그 아래 |
| 조용하면 성공 | 성공하면 아무 말도 안 함. **말이 나오면 대개 문제** |
| 공백이 구분자 | `ls /` (O) / `ls/` (X) — 명령어와 대상 사이에 공백 |
| 점으로 시작하면 숨김 | `.bashrc` 같은 파일은 `ls -a` 로만 보임 |
| `~` = 내 홈 폴더 | `/home/사용자명` 의 줄임말 |

---

## 지금 어디 있지 / 뭐가 있지

```bash
pwd                  # 현재 폴더 경로        (print working directory)
ls                   # 목록
ls -a                # 숨김 파일까지         (all)
ls -l                # 권한·소유자·크기·날짜  (long)
ls -alh              # 위 셋 다 + 읽기 쉬운 크기
ls -lt               # 최근 수정순 정렬  ← 장애 추적에 유용
cd 폴더명            # 이동                  (change directory)
cd ~                 # 홈으로
cd ..                # 한 단계 위로
cd -                 # 직전 폴더로 되돌아가기
```

## 파일 내용 보기

```bash
cat 파일             # 전체 출력 (짧은 파일용)
head -20 파일        # 앞 20줄
tail -20 파일        # 뒤 20줄        ← 로그는 대개 이것
tail -f 파일         # 계속 지켜보기   ← 실시간 로그. Ctrl+C 로 종료
less 파일            # 페이지 단위로 넘겨보기. q 로 종료
```

> 로그 파일에 `cat` 을 쓰면 수만 줄이 쏟아집니다. **로그는 `tail`.**

## 찾기

```bash
grep "검색어" 파일           # 파일 안에서 문자열 찾기
grep -r "검색어" 폴더        # 폴더 전체를 뒤져서       (recursive)
grep -i "검색어" 파일        # 대소문자 무시            (ignore case)
grep -n "검색어" 파일        # 줄 번호 표시             (number)
find /경로 -name "*.conf"    # 이름으로 파일 찾기
```

## 권한

```bash
ls -l 파일           # 권한 확인
chmod 644 파일       # 권한 변경     (change mode)
chown 사용자 파일    # 소유자 변경   (change owner)
sudo 명령            # 관리자 권한으로 실행  (superuser do)
whoami               # 나는 누구인가
id                   # 내 uid·소속 그룹
```

### 권한 표기 읽는 법

```
-  rw-  r--  r--
│   │    │    │
│   │    │    └─ others : 그 외 모든 사람
│   │    └────── group  : 그룹
│   └─────────── user   : 소유자
└─────────────── 종류   : - 파일 / d 폴더 / l 바로가기
```

| 글자 | 뜻 |
|---|---|
| `r` | read — 읽기 |
| `w` | write — 쓰기 |
| `x` | execute — 실행 |
| `-` | 권한 없음 |

**예시**

| 표기 | 의미 |
|---|---|
| `-rw-r--r--` | 소유자만 수정, **나머지는 읽기만** |
| `-rw-r-----` | 소유자·그룹만 읽기. **그 외는 아무것도 못 함** |
| `-rwx------` | 소유자만 전부 가능. 남은 접근 불가 |
| `drwxr-xr-x` | 폴더(`d`). 누구나 들어갈 수 있음 |

> 폴더의 `x`는 "실행"이 아니라 **"안으로 들어갈 수 있음"** 을 뜻합니다.

## 서비스 (웹서버·DB 등)

```bash
sudo systemctl status  서비스명   # 상태 확인   ← 가장 많이 씀
sudo systemctl restart 서비스명   # 재시작
sudo systemctl stop    서비스명   # 중지
sudo systemctl start   서비스명   # 시작
sudo systemctl enable  서비스명   # 부팅 시 자동 시작
journalctl -u 서비스명 -n 50      # 그 서비스 로그 최근 50줄
```

## 자원 상태 — 장애 대응 1순위

```bash
df -h                # 디스크 남은 공간   ← 꽉 차면 서비스가 멈춤
du -sh 폴더          # 이 폴더가 몇 GB인지
free -h              # 메모리
top                  # 실시간 자원 사용 (q 로 종료)
ps aux               # 실행 중인 프로세스 전체
ps aux | grep nginx  # 특정 프로세스만
uptime               # 서버가 얼마나 켜져 있었나 + 부하
```

## 패키지 (프로그램 설치)

```bash
sudo apt update              # 설치 가능 목록 갱신  ← 먼저 실행
sudo apt upgrade             # 설치된 것 최신화
sudo apt install 프로그램명
sudo apt remove  프로그램명
apt list --installed         # 설치된 것 목록
```

> `update` 는 **목록만** 갱신합니다. 실제 업그레이드는 `upgrade`. 헷갈리기 쉽습니다.

## 파일 편집

```bash
nano 파일            # 초보자용 편집기
```

nano 단축키: `Ctrl+O` 저장 → `Enter` → `Ctrl+X` 종료

> 설정 파일을 고칠 땐 **먼저 백업**하세요:
> `sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak`

## 네트워크 · 포트

```bash
curl -I https://주소          # 응답 헤더만 보기 (상태 코드 확인)
curl https://주소             # 내용 받아오기
ping 주소                     # 연결되는지
hostname -I                   # 이 서버의 IP 주소
```

### 응답만 확인하고 싶을 때

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8888
```

`-s` 조용히 · `-o /dev/null` 내용은 버림 · `-w "%{http_code}"` **상태 코드만** 출력.
"서버가 살아 있나"만 볼 때 씁니다.

### 포트 확인 — "서버는 도는데 접속이 안 될 때" 1순위

```bash
ss -tln                       # 열려 있는 포트 목록
ss -tlnp                      # + 어떤 프로그램인지 (sudo 필요)
```

`-t` TCP · `-l` 대기 중(listen) · `-n` 이름 대신 번호 · `-p` 프로그램 이름

| 출력 | 뜻 |
|---|---|
| `0.0.0.0:8888` | **모든 주소**에서 받는 중 — 웹서버는 이게 정상 |
| `127.0.0.1:5432` | **자기 자신만** — DB는 이게 정상 |
| `0.0.0.0:5432` | 🚨 **DB가 외부에 열려 있음** |

Windows 쪽 포트를 볼 때 (PowerShell):

```powershell
Get-NetTCPConnection -LocalPort 8888 -State Listen
netstat -ano | findstr :8888
```

---

## 서비스 다루기 — nginx · PostgreSQL

```bash
sudo systemctl status  nginx      # 상태 확인      ← 가장 많이 씀
sudo systemctl restart nginx      # 재시작
sudo systemctl start   nginx      # 시작
sudo systemctl stop    nginx      # 중지
systemctl is-active    nginx      # active / inactive 만 짧게
```

### 설정을 바꿀 때 순서

```
① 백업  →  ② 수정  →  ③ 문법 검사  →  ④ 재시작  →  ⑤ 검증
```

```bash
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak
sudo nano /etc/nginx/sites-available/default
sudo nginx -t                     # ← ③ 문법 검사. 건너뛰지 말 것
sudo systemctl restart nginx
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8888
```

> **`nginx -t` 를 건너뛰고 재시작하면**, 오타가 있을 때 nginx 가 아예 안 뜹니다.
> 실서버라면 그 순간 사이트가 멈춥니다.

### `active (exited)` 는 오류가 아니다

PostgreSQL 은 껍데기 서비스가 실제 프로세스를 띄우고 빠집니다.

```bash
sudo systemctl status postgresql            # active (exited)  ← 정상
sudo systemctl status postgresql@16-main    # active (running) ← 실제 상태
```

---

## PostgreSQL · psql

```bash
sudo -u postgres psql                  # 관리자로 접속 (peer 인증, 비밀번호 없음)
psql -h localhost -U 계정 -d DB이름     # 다른 계정으로 (비밀번호 물음)
psql -c "select ..."                   # 접속하지 않고 명령 하나만 실행
```

`-h` host(주소) · `-U` **U**ser(대문자!) · `-d` database

> ⚠️ **리눅스 옵션은 대소문자를 구분합니다.** `-u` 와 `-U` 는 다른 옵션입니다.

### psql 안에서

| 명령 | 뜻 |
|---|---|
| `\l` | 데이터베이스 목록 (**백**슬래시. 한글 키보드의 `₩` 키) |
| `\du` | 사용자 목록 |
| `\c DB이름` | 다른 DB로 이동 |
| `\conninfo` | 지금 어디에 누구로 접속했나 |
| `\q` | 나가기 |

### 프롬프트가 위치를 알려준다

| 프롬프트 | 여기서 칠 수 있는 것 |
|---|---|
| `사용자@호스트:~$` | **리눅스 명령** (`ls`, `sudo`, `grep`) |
| `DB이름=#` | **SQL** (관리자) |
| `DB이름=>` | **SQL** (일반 사용자) |
| `DB이름-#` | **명령이 안 끝남** — `;` 을 기다리는 중 |

`$` 면 리눅스, `=#`·`=>` 면 SQL. **헷갈리면 프롬프트를 보세요.**
빠져나오려면 `Ctrl + C`, psql 자체를 나가려면 `\q`.

### 백업

```bash
pg_dump --schema=public --no-owner --no-privileges > backup.sql
```

> **`pg_dump` 버전은 서버 버전보다 같거나 높아야 합니다.** 낮으면 아예 거부됩니다.
> 여러 버전이 깔려 있으면 경로를 직접 지정하세요: `/usr/lib/postgresql/17/bin/pg_dump`

---

## 압축 · 파일 정리

```bash
gzip 파일              # 압축 (원본은 사라짐 → 파일.gz)
gunzip 파일.gz         # 풀기
gzip -t 파일.gz        # 손상 여부 검사      ← 백업 검증에 유용
zgrep "찾을단어" 파일.gz  # 압축을 풀지 않고 검색
zcat 파일.gz           # 압축을 풀지 않고 내용 보기
```

```bash
find 폴더 -name "*.log" -mtime +30 -delete    # 30일 지난 로그 삭제
find 폴더 -name "*.sql" -size 0 -print -delete # 빈 파일 찾아서 삭제
```

> ⚠️ `-delete` 를 쓸 때는 **`-print` 를 함께** 붙여 무엇이 지워지는지 확인하세요.
> 또는 `-delete` 없이 먼저 실행해서 목록만 보는 게 안전합니다.

---

## 환경변수 · `.env`

```bash
set -a; . ./.env; set +a      # .env 값을 불러와 다른 프로그램에도 전달
```

`set -a` 이후 읽는 변수를 자동으로 내보냄 · `. ./.env` 파일을 현재 셸로 불러오기 · `set +a` 해제

> ⚠️ **값에 `$`, `` ` ``, `\` 가 있으면 작은따옴표로 감싸세요.**
> `PGPASSWORD=abc$def` 처럼 쓰면 bash 가 `$def` 를 변수로 해석해 **값이 조용히 잘립니다.**
> `PGPASSWORD='abc$def'` 로 써야 글자 그대로 전달됩니다.

비밀이 든 파일은 반드시:

```bash
chmod 600 ~/site-backup/.env    # 나만 읽기·쓰기
ls -l ~/site-backup/.env        # -rw------- 인지 확인
```

> ⚠️ **`/mnt` 아래(Windows 파일)에는 `chmod` 가 적용되지 않습니다.** 전부 `777` 로 표시됩니다.
> 비밀 파일은 리눅스 파일시스템(`~/`)에 두세요.

---

## 정기 실행 (cron)

```bash
crontab -e        # 편집 (처음엔 편집기 선택 — nano 번호 고르기)
crontab -l        # 등록된 목록 보기
```

```
0 3 * * * /경로/스크립트.sh >> /경로/로그.log 2>&1
분 시 일 월 요일
```

`*` 는 "모든". 위 예시는 **매일 새벽 3시**.

| 기호 | 뜻 |
|---|---|
| `>>` | 출력을 파일에 **덧붙이기** (`>` 는 덮어쓰기) |
| `2>&1` | **오류 메시지도** 같은 파일로 |
| `2>/dev/null` | 오류를 **버리기** |

> **cron 은 화면이 없습니다.** 로그를 안 남기면 몇 달째 실패해도 모릅니다.

---

## 패키지 저장소 추가 (기본 저장소에 없는 버전이 필요할 때)

```bash
sudo install -d /usr/share/postgresql-common/pgdg
sudo curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
  https://www.postgresql.org/media/keys/ACCC4CF8.asc
sudo sh -c 'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] \
  https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
  > /etc/apt/sources.list.d/pgdg.list'
sudo apt update && sudo apt install -y postgresql-client-17
```

**서명 키를 먼저 받는 이유:** 그 키로 "진짜 배포처가 만든 패키지인가"를 검증합니다.
키 없이 저장소를 추가하면 위조된 패키지를 받을 위험이 있습니다.

---

## Windows 파일 접근 (WSL 전용)

```bash
ls /mnt                              # 연결된 드라이브 목록 (c, d, e ...)
cd /mnt/e/claude/site-test-db        # E:\claude\site-test-db
df -h                                # 드라이브별 남은 공간
explorer.exe .                       # 현재 폴더를 Windows 탐색기로 열기
explorer.exe http://localhost:8888   # 기본 브라우저로 주소 열기
code .                               # 현재 폴더를 VS Code로 열기
```

> **왜 `/mnt` 인가:** 리눅스에는 드라이브 문자가 없습니다. `/` 하나가 뿌리고,
> 외부 저장장치는 **`/mnt`(mount, 연결 지점) 아래에 붙입니다.**

| 위치 | 속도 | 권한 |
|---|---|---|
| `~/` (리눅스 안) | **빠름** | **진짜 권한** |
| `/mnt/...` (Windows) | 느림 | 전부 `777` (의미 없음) |

## Windows 파일 접근 (WSL 전용)

```bash
ls /mnt                              # 연결된 드라이브 목록
cd /mnt/e/claude/site-test-db        # E:\claude\site-test-db
explorer.exe .                       # 현재 폴더를 Windows 탐색기로 열기
code .                               # 현재 폴더를 VS Code로 열기
```

---

## 오류 메시지 — 반드시 구분

**메시지가 어디를 고쳐야 할지 알려줍니다.** 구분을 못 하면 엉뚱한 곳을 헤맵니다.

### 파일 · 명령

| 메시지 | 우리말 | 확인할 것 |
|---|---|---|
| `No such file or directory` | 파일이 **없음** | 경로 오타, 현재 위치(`pwd`) |
| `Permission denied` | 파일은 있는데 **권한 없음** | `ls -l` 확인, `sudo` 필요? |
| `command not found` | **명령어가 없음** | 오타, 또는 설치 안 됨 |
| `Exec format error` | **실행 방법을 모름** | 형식 문제 (WSL 이면 interop) |

### 접속

| 메시지 | 우리말 | 뜻 |
|---|---|---|
| `could not translate host name` | 주소를 **IP 로 못 바꿈** | DNS 문제 · 주소 오타 · 상대 서버가 사라짐 |
| **`Connection refused`** | 연결이 **거부됨** | **아무도 안 듣고 있음** — 포트가 닫힘 |
| `password authentication failed` | 비밀번호 인증 **실패** | **서버에는 닿았음.** 자격증명만 틀림 |
| `timeout` | 응답 없음 | 방화벽이 조용히 막는 중 |

> **`Connection refused` 와 `password ... failed` 의 차이가 중요합니다.**
> 앞은 **닿지도 못한 것**, 뒤는 **닿았는데 인증만 실패**한 것입니다.
> 뒤가 나오면 주소·포트는 맞다는 뜻이라 범위가 절반으로 줄어듭니다.

### DB · 도구

| 메시지 | 우리말 | 뜻 |
|---|---|---|
| `violates check constraint` | 검사 제약 **위반** | 값의 형식이 규칙에 안 맞음 |
| `duplicate key value` | 키 값 **중복** | 이미 있는 값을 또 넣으려 함 |
| `syntax error at or near "x"` | `x` 부근 **문법 오류** | 내가 잘못 씀 (`^` 가 위치를 가리킴) |
| `server version mismatch` | 서버 버전 **불일치** | 클라이언트가 서버보다 낮음 |
| `Failed to fetch` (브라우저) | 가져오기 **실패** | **서버에 닿지도 못함** — 네트워크 쪽 문제 |

> `syntax error` 는 **내 잘못**, `permission denied` 는 **막힌 것**(의도된 동작).
> 둘을 구분해야 "고쳐야 할 것"과 "정상 동작"을 헷갈리지 않습니다.

---

## 실제로 겪은 사례

자세한 원인과 조치는 `docs/runbook/` 에 있습니다.

| 증상 | 원인 | 기록 |
|---|---|---|
| `Exec format error` | systemd 가 WSL interop 등록을 지움 | [runbook](runbook/wsl-interop-exec-format-error.md) |
| nginx 는 도는데 IIS 페이지가 뜸 | Windows IIS 가 포트 점유 | [runbook](runbook/nginx-port-conflict-iis.md) |
| `Failed to fetch` | Supabase 무료 플랜 일시정지 | [runbook](runbook/supabase-free-tier-paused.md) |
| DB 가 외부에 열려 있나 | 점검 절차 | [runbook](runbook/db-external-exposure-check.md) |
| `password ... failed` (반복) | `.env` 값의 특수문자가 bash 에 해석되어 잘림 | 본 문서 「환경변수」 참조 |
| `server version mismatch` | `pg_dump` 가 서버보다 낮은 버전 | `scripts/README.md` |

---

## 터미널 조작

| 키 | 동작 |
|---|---|
| `Tab` | **자동완성** ← 오타 방지. 적극 활용 |
| `↑` `↓` | 이전 명령 불러오기 |
| `Ctrl + C` | 실행 중인 명령 중단 |
| `Ctrl + L` | 화면 지우기 |
| `Ctrl + R` | 이전 명령 검색 |
| **마우스 우클릭** | 붙여넣기 (`Ctrl+V` 안 됨) |
| `Esc` | 선택 모드 해제 ← 창이 멈췄을 때 |

> **`Tab` 자동완성이 가장 유용합니다.** 경로를 절반만 치고 `Tab` 을 누르면 완성됩니다.
> 오타로 인한 `No such file` 을 대부분 예방합니다.

---

## 명령이 뭔지 모를 때

```bash
man 명령어           # 설명서          (manual). q 로 종료
명령어 --help        # 짧은 도움말
which 명령어         # 그 명령이 어디 설치돼 있나
```

---

## 진단 순서 — 어떤 장애든 동일

```
① 증상 확인      무엇이 어떻게 안 되는가
② 메시지 해석    오류 문구를 정확히 읽는다
③ 상태 조회      관련 상태를 명령으로 확인
④ 원인 추정      왜 이렇게 됐는가
⑤ 조치          고친다
⑥ 검증          ← 실제로 동작하는지 테스트. 빠뜨리기 쉬움
```

**⑥을 빠뜨리면 "고친 줄 알았는데 안 고쳐진" 상태가 됩니다.**
