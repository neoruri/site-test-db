# 백업 스크립트

## 구성

```
~/site-backup/              ← WSL 리눅스 홈 (권한 700)
├── .env                    ← 접속 정보 (권한 600, git 밖)
├── backup-db.sh            ← 이 폴더의 스크립트를 복사한 것
├── backup.log              ← cron 실행 기록
└── output/                 ← 백업 파일 (권한 600)
    └── db_2026-09-15_1431.sql.gz
```

**왜 프로젝트 폴더가 아니라 `~/` 인가:**
`/mnt` 아래(Windows 파일)는 리눅스 권한이 적용되지 않습니다. 전부 `777` 로 표시되어
`chmod 600` 을 걸어도 소용이 없습니다. **비밀을 담는 파일은 리눅스 파일시스템에 둬야** 보호됩니다.

## 설치

```bash
mkdir -p ~/site-backup/output && chmod 700 ~/site-backup
cp /mnt/e/claude/site-test-db/scripts/backup-db.sh ~/site-backup/
chmod +x ~/site-backup/backup-db.sh
```

`.env` 는 `.env.example` 을 참고해서 직접 만듭니다. **반드시 `chmod 600`.**

## 수동 실행

```bash
~/site-backup/backup-db.sh
```

## 자동 실행 (cron) — 아직 등록 안 함

> **cron** = 리눅스의 정기 실행 기능. "매일 몇 시에 이 명령을 실행하라"를 등록해둔다.

```bash
crontab -e
```

처음 실행하면 편집기를 고르라고 묻습니다. `nano` 번호를 선택하세요.

맨 아래에 추가:

```
0 3 * * * /home/neoguri/site-backup/backup-db.sh >> /home/neoguri/site-backup/backup.log 2>&1
```

### 시간 표기 읽는 법

```
0    3    *    *    *
분   시   일   월   요일
```

`*` 는 "모든" 이라는 뜻. 위 설정은 **매일 새벽 3시 0분**.

| 예 | 뜻 |
|---|---|
| `0 3 * * *` | 매일 새벽 3시 |
| `30 2 * * 0` | 매주 일요일 2시 30분 |
| `0 */6 * * *` | 6시간마다 |

### 뒷부분이 중요하다

```
>> /home/neoguri/site-backup/backup.log 2>&1
```

| 기호 | 뜻 |
|---|---|
| `>>` | 출력을 파일에 **덧붙이기** (`>` 는 덮어쓰기) |
| `2>&1` | **오류 메시지도** 같은 파일로 |

**cron 은 화면이 없습니다.** 새벽 3시에 실패해도 아무도 못 봅니다.
로그를 안 남기면 **백업이 몇 달째 실패하고 있어도 모릅니다.**

### 등록 확인

```bash
crontab -l          # 등록된 작업 목록
cat ~/site-backup/backup.log    # 실행 기록
```

### ⚠️ WSL 의 한계

**PC 가 켜져 있고 WSL 이 실행 중이어야 cron 이 돕니다.**
PC 를 끄면 그날 백업은 건너뜁니다. 실서비스에서는 VPS 나 클라우드에서 돌려야 합니다.
스크립트는 그대로 옮겨서 쓸 수 있습니다.

---

## 스크립트가 하는 일

| 단계 | 내용 |
|---|---|
| 1 | `.env` 에서 접속 정보 읽기 |
| 1-1 | 설치된 것 중 **가장 높은 버전의 `pg_dump`** 선택 |
| 2 | `pg_dump` 로 `public` 스키마 백업 |
| 3 | **검증** — 크기 1000바이트 미만이거나 `CREATE TABLE` 이 없으면 실패 처리 후 파일 삭제 |
| 4 | 압축 + 권한 600 |
| 5 | `KEEP_DAYS` 일 지난 백업 삭제 |

### 왜 검증 단계가 있나

**"백업을 만들었다"와 "쓸 수 있는 백업이 있다"는 다릅니다.**

실제로 겪은 일: `pg_dump` 버전이 낮아 실패했을 때 **0바이트 파일이 남았습니다.**
목록만 보면 백업이 있는 것처럼 보이지만 내용은 비어 있었습니다.
검증이 없으면 **복구하려는 순간에야** 알게 됩니다.

### `pg_dump` 버전 규칙

```
pg_dump 버전 >= 서버 버전    ✅
pg_dump 버전 <  서버 버전    ❌ 거부됨
```

Supabase 는 PostgreSQL 17, Ubuntu 24.04 기본 패키지는 16이라 17 클라이언트를 따로 설치했습니다.

```bash
sudo install -d /usr/share/postgresql-common/pgdg
sudo curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc
sudo sh -c 'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
sudo apt update
sudo apt install -y postgresql-client-17
```

**서버를 업그레이드하면 백업 도구도 올려야 합니다.** 안 그러면 어느 날 갑자기 백업이 멈춥니다.

---

## 아직 안 한 것

- [ ] cron 등록
- [ ] **💥 복구 테스트** — 백업으로 실제로 되살려보기
- [ ] Storage(첨부 이미지) 백업 — `rclone` + S3 프로토콜
- [ ] 백업을 다른 위치로 복사 (지금은 같은 PC 에만 있음)

> **복구 테스트를 안 한 백업은 백업이 아닙니다.**
> 파일이 생겼다는 것과 그걸로 되살릴 수 있다는 것은 다릅니다.
