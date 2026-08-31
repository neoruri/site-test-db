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

## 네트워크

```bash
curl -I https://주소          # 응답 헤더만 보기 (상태 코드 확인)
curl https://주소             # 내용 받아오기
ss -tlnp                      # 열려 있는 포트 목록
ping 주소                     # 연결되는지
```

## Windows 파일 접근 (WSL 전용)

```bash
ls /mnt                              # 연결된 드라이브 목록
cd /mnt/e/claude/site-test-db        # E:\claude\site-test-db
explorer.exe .                       # 현재 폴더를 Windows 탐색기로 열기
code .                               # 현재 폴더를 VS Code로 열기
```

---

## 오류 메시지 3종 — 반드시 구분

| 메시지 | 뜻 | 확인할 것 |
|---|---|---|
| `No such file or directory` | **파일이 없음** | 경로 오타, 현재 위치(`pwd`) |
| `Permission denied` | **권한 없음** | `ls -l` 로 권한 확인, `sudo` 필요? |
| `command not found` | **명령어가 없음** | 오타, 또는 설치 안 됨 |
| `Exec format error` | **실행 방법을 모름** | 형식 문제 (WSL이면 interop) |

**이 구분을 못 하면 엉뚱한 곳을 고치게 됩니다.**

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
