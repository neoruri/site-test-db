---
제목: WSL에서 Windows 프로그램 실행 시 Exec format error
분류: 오류대응
태그: wsl, systemd, binfmt, vscode
발생일: 2026-08-26
심각도: 보통
---

## 증상

WSL(Ubuntu) 터미널에서 `code .` 실행 시:

```
/mnt/c/Users/y-pc/AppData/Local/Programs/Microsoft VS Code/bin/code: 62:
/mnt/c/.../Code.exe: Exec format error
```

Windows 프로그램(`.exe`)을 리눅스에서 실행할 수 없는 상태.
`cmd.exe`, `explorer.exe` 등 다른 Windows 실행 파일도 동일하게 실패.

## 원인

**`binfmt_misc` 등록표에서 `WSLInterop` 항목이 사라졌다.**

- `binfmt_misc` — 리눅스 커널 기능. "이 형식의 파일은 이 프로그램으로 실행하라"는 등록표
- `WSLInterop` — 그 등록표의 항목. "Windows `.exe`를 만나면 `/init`(WSL 브리지)으로 넘겨라"

등록이 없으면 커널이 `.exe` 형식을 해석하지 못한다 → `Exec format error`.

**왜 사라졌나:** `/etc/wsl.conf`에 `systemd=true`가 설정돼 있고(Ubuntu 24.04 기본),
systemd의 `systemd-binfmt` 서비스가 등록표를 자기 기준으로 초기화하면서
WSL이 미리 넣어둔 항목을 지우는 알려진 충돌.

## 확인 방법

```bash
ls /proc/sys/fs/binfmt_misc/
```

| 결과 | 판정 |
|---|---|
| `WSLInterop  register  status` | 정상 |
| `register  status` | **문제** — WSLInterop 없음 |

systemd 사용 여부:
```bash
ps -p 1 -o comm=          # systemd 가 나오면 systemd 사용 중
cat /etc/wsl.conf
```

실제 동작 테스트 (등록만 확인하고 끝내지 말 것):
```bash
/mnt/c/Windows/System32/cmd.exe /c echo interop_ok
```

## 조치

관리자 PowerShell에서:

```bash
wsl --shutdown
```

⚠️ 열려 있는 WSL 터미널·VS Code 창이 모두 닫힌다. 데이터는 지워지지 않음.
이후 Ubuntu를 다시 열면 WSL이 초기화되면서 `WSLInterop`이 재등록된다.

**결과:** 재시작 후 `WSLInterop` 등록 확인, `cmd.exe` 실행 테스트 통과.

## 재발 방지

재부팅 후 재발할 수 있음. 반복되면 systemd가 등록표를 초기화할 때
이 항목을 **다시 넣도록** 지시하는 파일을 만든다.

```bash
echo ':WSLInterop:M::MZ::/init:PF' | sudo tee /usr/lib/binfmt.d/WSLInterop.conf
```

되돌리기: `sudo rm /usr/lib/binfmt.d/WSLInterop.conf`

> 이 방법이 모든 WSL 버전에서 동작하는지는 미검증. 재발 시 확인 필요.

## 배운 것

**1. 오류 메시지 두 가지를 구분한다**

| 메시지 | 뜻 |
|---|---|
| `No such file or directory` | 파일이 없음 (경로·오타 문제) |
| `Permission denied` | 파일은 있으나 권한 없음 |
| `Exec format error` | 파일은 있으나 **실행 방법을 모름** |

셋을 헷갈리면 엉뚱한 곳을 고치게 된다.

**2. "고쳤다"와 "고쳐진 걸 확인했다"는 다르다**

`ls`로 등록만 확인하고 끝냈다면, 등록은 됐는데 실제로는 안 되는 경우를 놓쳤을 것이다.
**조치 후에는 반드시 실제 동작을 테스트한다.**

**3. 진단 순서는 어떤 장애에도 같다**

```
증상 확인 → 메시지 해석 → 상태 조회 → 원인 추정 → 조치 → 검증
```

이 사례를 전에 본 적이 없어도 풀렸다. 메시지를 읽고 "등록 문제겠다"고 추론한 뒤
등록표를 조회했기 때문. **사례를 외우는 것보다 이 순서가 중요하다.**
