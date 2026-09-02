---
제목: 서버는 도는데 브라우저에서 접속 안 됨 — 포트 충돌 (IIS)
분류: 오류대응
태그: nginx, 포트, wsl, iis
발생일: 2026-09-02
심각도: 보통
---

## 증상

WSL2에 nginx를 설치·시작했고 `systemctl status nginx`는 `active (running)`.
그런데 브라우저에서 `http://localhost` 를 열면 nginx 페이지가 아니라
**IIS 기본 페이지**가 뜸. 8080으로 옮겼더니 이번엔 **403 Forbidden**.

## 원인

**Windows의 IIS가 80·8081·8082·8088 포트를 이미 점유하고 있었다.**

WSL2는 Windows의 localhost 요청을 WSL 안으로 넘겨주는데,
**Windows 쪽에서 이미 그 포트를 쓰고 있으면 Windows 프로그램이 우선**한다.
그래서 요청이 nginx에 도달하지 못하고 IIS가 응답했다.

핵심 규칙: **한 포트는 한 프로그램만 쓸 수 있다.**

## 확인 방법

**서버 자체는 정상인지** (WSL 안에서 직접 확인 — 브라우저 변수를 제거)
```bash
systemctl is-active nginx
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8888
```
`200` 이면 nginx는 정상. 문제는 그 바깥에 있다.

**누가 그 포트를 쓰는지** (Windows, PowerShell)
```powershell
Get-NetTCPConnection -LocalPort 8080 -State Listen |
  ForEach-Object { Get-Process -Id $_.OwningProcess }
```

**빈 포트 찾기**
```powershell
Get-NetTCPConnection -State Listen |
  Select-Object -ExpandProperty LocalPort -Unique | Sort-Object
```

**리눅스에서 포트 확인**
```bash
ss -tlnp
```

## 조치

IIS는 업무 환경이라 건드리지 않고, **nginx를 빈 포트(8888)로 옮겼다.**

⚠️ 설정 파일 수정 전 백업:
```bash
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak
```

`/etc/nginx/sites-available/default` 의 `listen` 두 줄을 수정:
```nginx
listen 8888 default_server;
listen [::]:8888 default_server;
```

```bash
sudo nginx -t                    # 문법 검사 — 재시작 전에 반드시
sudo systemctl restart nginx
```

되돌리기: `sudo cp .../default.bak .../default` 후 재시작.

## 재발 방지

- 새 서비스를 띄우기 전에 **포트가 비었는지 먼저 확인**한다
- 설정 파일은 **수정 전 백업**, 재시작 전 **`nginx -t`**

## 배운 것

**1. 진단은 "안"과 "밖"을 나누는 것부터**

```
접속 안 됨
 → 서버가 도나?          systemctl is-active
 → 서버가 응답하나?      curl (서버 안에서)      ← 여기서 200이면
 → 밖에서 왜 안 닿나?    포트 / 방화벽 / DNS       문제는 바깥
```

**서버 안에서는 되는데 밖에서 안 되면 — 포트 아니면 방화벽이다.**

**2. `curl`은 브라우저 변수를 제거하는 도구**

브라우저는 캐시·확장·검색 리다이렉트 등 변수가 많다.
`curl`로 서버만 직접 두드려보면 문제 범위가 절반으로 줄어든다.

**3. 설정 변경 3단계는 항상 같다**

```
백업 → 수정 → 문법검사 → 재시작 → 검증
```

`nginx -t` 를 건너뛰고 재시작하면, 오타가 있을 때 **nginx가 아예 안 뜬다.**
실서버라면 그 순간 사이트가 멈춘다.
