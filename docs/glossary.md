# 백엔드 용어 사전

실제로 마주칠 용어만 모았습니다. 새 용어가 나오면 여기 추가합니다.

> 읽는 법: **약어 → 원어 → 우리말 → 한 줄 설명** 순서입니다.
> 영어 원어가 개념을 그대로 설명해주는 경우가 많아서 원어를 함께 적었습니다.

---

## 인증과 인가 — 가장 헷갈리는 영역

| 용어 | 원어 | 뜻 |
|---|---|---|
| **Auth** | Authentication 또는 Authorization | **둘 다** 줄여 부름 → 그래서 헷갈림 |
| **AuthN** | **Auth**enticatio**n** | **인증** — "너 누구야?" (로그인) |
| **AuthZ** | **Auth**ori**z**ation | **인가** — "너 이거 해도 돼?" (권한 확인) |
| 세션 | session | 로그인 상태를 서버가 기억하는 방식 |
| 토큰 | token | 로그인했다는 증명서. 요청할 때마다 들고 감 |
| **JWT** | JSON Web Token | 정보를 담은 토큰. "제이더블유티" 또는 "조트" |
| **OAuth** | Open Authorization | 구글·카카오 계정으로 로그인하는 방식 |
| **SSO** | Single Sign-On | 한 번 로그인으로 여러 서비스 이용 |
| **MFA / 2FA** | Multi/Two-Factor Authentication | 다중 인증. 비밀번호 + 문자·앱 |
| **uid** | User ID | 사용자 고유 번호 |
| 세션 만료 | session expiry | 일정 시간 뒤 자동 로그아웃 |

> **인증 없이 인가는 없습니다.** 누군지 알아야 권한을 따질 수 있습니다.
> 그리고 **인증만 하고 인가를 빼먹는 것**이 백엔드 사고 1위입니다.

---

## 웹·네트워크

| 용어 | 원어 | 뜻 |
|---|---|---|
| **HTTP** | HyperText Transfer Protocol | 웹에서 데이터를 주고받는 규칙 |
| **HTTPS** | HTTP **Secure** | 암호화된 HTTP. 자물쇠 아이콘 |
| **SSL / TLS** | Secure Sockets Layer / Transport Layer Security | HTTPS를 만드는 암호화 기술. TLS가 후속 |
| **API** | Application Programming Interface | 프로그램끼리 대화하는 창구 |
| **REST** | REpresentational State Transfer | API 설계 방식. `GET /orders/123` 같은 형태 |
| **URL / URI** | Uniform Resource Locator / Identifier | 주소 |
| **DNS** | Domain Name System | 도메인 이름 ↔ IP 주소 변환표 |
| **CORS** | Cross-Origin Resource Sharing | 다른 도메인에서 요청을 허용할지 결정하는 규칙 |
| **CDN** | Content Delivery Network | 이미지·파일을 여러 지역에 복사해두고 가까운 곳에서 주는 서비스 |
| 포트 | port | 서버의 출입구 번호. 웹은 80(HTTP)/443(HTTPS) |
| 엔드포인트 | endpoint | API의 개별 주소 하나 |
| 페이로드 | payload | 요청·응답에 실려 가는 실제 데이터 |

### 자주 보는 HTTP 상태 코드

| 코드 | 뜻 | 누구 잘못 |
|---|---|---|
| `200` | 성공 | — |
| `301 / 302` | 다른 주소로 이동 | — |
| `400` | 잘못된 요청 | 보낸 쪽 |
| **`401`** | **인증 안 됨** (로그인 필요) | 보낸 쪽 |
| **`403`** | **인가 없음** (로그인은 했으나 권한 없음) | 보낸 쪽 |
| `404` | 없는 주소 | 보낸 쪽 |
| **`500`** | **서버 내부 오류** | **서버 쪽** |
| `502 / 504` | 뒤쪽 서버가 응답 안 함 | 서버 쪽 |

> `401`과 `403`의 차이가 곧 **인증과 인가의 차이**입니다.

---

## 데이터베이스

| 용어 | 원어 | 뜻 |
|---|---|---|
| **DB** | Database | 데이터 저장소 |
| **SQL** | Structured Query Language | DB에 명령하는 언어. "에스큐엘" 또는 "시퀄" |
| **RLS** | Row Level Security | **행 단위 보안.** 행 하나하나에 접근 권한을 거는 것 |
| **CRUD** | Create, Read, Update, Delete | 생성·조회·수정·삭제. 데이터 처리의 기본 4종 |
| **PK** | Primary Key | 기본키. 행을 구분하는 고유 값 (보통 `id`) |
| **FK** | Foreign Key | 외래키. 다른 테이블을 가리키는 값 |
| 스키마 | schema | DB의 구조 설계도 (테이블·컬럼 정의) |
| 인덱스 | index | 검색을 빠르게 하는 색인. 책 뒤의 찾아보기 |
| 트랜잭션 | transaction | 여러 작업을 **전부 성공 or 전부 취소**로 묶는 것 |
| 마이그레이션 | migration | DB 구조 변경을 기록·적용하는 것 |
| **ORM** | Object-Relational Mapping | 코드로 DB를 다루게 해주는 도구 |
| 쿼리 | query | DB에 던지는 질문·명령 |
| 커넥션 풀 | connection pool | DB 연결을 미리 만들어두고 재사용하는 것 |

---

## 서버·리눅스

| 용어 | 원어 | 뜻 |
|---|---|---|
| **OS** | Operating System | 운영체제 |
| **SSH** | Secure Shell | 서버에 원격 접속하는 암호화된 방식 |
| **VPS** | Virtual Private Server | 가상으로 쪼갠 개인 서버 |
| **IDC** | Internet Data Center | 서버를 모아둔 건물 |
| **LTS** | Long Term Support | 장기 지원 버전. 보안 패치를 오래 줌 |
| 커널 | kernel | OS의 핵심. 하드웨어와 프로그램 사이 중개자 |
| 데몬 | daemon | 백그라운드에서 계속 도는 프로그램 (웹서버 등) |
| 프로세스 | process | 실행 중인 프로그램 하나 |
| **systemd** | system daemon | 리눅스 서비스 관리자. `systemctl`로 조작 |
| **sudo** | **s**uper**u**ser **do** | 관리자 권한으로 실행 |
| root | — | 최고 관리자 계정 (uid 0) |
| 방화벽 | firewall | 어떤 포트를 열지 통제하는 장치 |
| **ufw** | Uncomplicated FireWall | Ubuntu의 간편 방화벽 도구 |
| 마운트 | mount | 저장장치를 폴더에 연결하는 것 |
| 스냅샷 | snapshot | 서버 상태를 통째로 저장. 복구가 빠름 |
| **1U** | 1 Unit | 서버 랙 높이 단위 (약 4.45cm) |

---

## 보안

| 용어 | 원어 | 뜻 |
|---|---|---|
| **XSS** | Cross-Site Scripting | 남의 스크립트가 내 페이지에서 실행되는 취약점 |
| **CSRF** | Cross-Site Request Forgery | 사용자 모르게 요청을 보내게 만드는 공격 |
| **SQLi** | SQL Injection | 쿼리에 악성 코드를 끼워 넣는 공격 |
| **IDOR** | Insecure Direct Object Reference | **URL의 id만 바꿔 남의 데이터를 보는 것.** 인가 실패의 대표 사례 |
| 해시 | hash | **되돌릴 수 없는** 변환. 비밀번호 저장에 사용 |
| 암호화 | encryption | **되돌릴 수 있는** 변환 (열쇠 필요) |
| salt | salt(소금) | 해시에 섞는 무작위 값. 같은 비밀번호도 다른 해시가 나오게 함 |
| 평문 | plaintext | 암호화되지 않은 원본 |
| 공격 표면 | attack surface | 공격당할 수 있는 지점의 총량. 적을수록 안전 |
| 최소 권한 | least privilege | 필요한 만큼만 권한을 주는 원칙 |
| **OWASP** | Open Web Application Security Project | 웹 보안 취약점 목록을 정리하는 단체 |

> **해시와 암호화를 반드시 구분하세요.**
> 비밀번호는 **해시**(되돌릴 수 없음), 카드번호 같은 건 **암호화**(나중에 원본이 필요).

---

## 개발·배포

| 용어 | 원어 | 뜻 |
|---|---|---|
| 런타임 | runtime | 언어를 실행해주는 환경 (Node.js, .NET, JVM) |
| 프레임워크 | framework | 구조를 미리 짜둔 뼈대 (Express, Spring Boot) |
| 라이브러리 | library | 가져다 쓰는 부품 모음 |
| 패키지 | package | 배포 가능한 코드 묶음 |
| 의존성 | dependency | 이 프로그램이 필요로 하는 다른 패키지 |
| **CI/CD** | Continuous Integration / Delivery | 자동 검사·자동 배포 |
| 배포 | deploy | 만든 것을 실제 서버에 올리는 것 |
| 롤백 | rollback | 이전 버전으로 되돌리는 것 |
| 환경변수 | environment variable | 코드 밖에 두는 설정값. 키·비밀번호를 여기 둠 |
| **.env** | environment | 환경변수를 적어두는 파일. **절대 커밋 금지** |
| 레포 | repository | 저장소 |
| 마이그레이션 | migration | 구조 변경을 단계별로 기록·적용 |
| dev / prod | development / production | 개발용 / **실서비스용** |
| **dev/prod parity** | — | 개발 환경과 실서비스 환경을 같게 유지하는 원칙 |
| 스테이징 | staging | 실서비스 직전에 확인하는 중간 환경 |

---

## 헷갈리기 쉬운 짝

| A | B | 차이 |
|---|---|---|
| 인증 (AuthN) | 인가 (AuthZ) | 누구인가 / 권한이 있는가 |
| 해시 | 암호화 | 되돌릴 수 없음 / 있음 |
| 라이브러리 | 프레임워크 | 내가 부름 / 나를 부름 |
| 런타임 | 프레임워크 | 실행 환경 / 코드 구조 |
| 401 | 403 | 로그인 안 됨 / 권한 없음 |
| `No such file` | `Permission denied` | 파일이 없음 / 권한이 없음 |
| Publishable key | Secret key | 공개돼도 됨 / RLS를 우회함 |
| 공유 웹호스팅 | VPS | root 없음 / root 있음 |
| JSP | Spring Boot | 옛 방식 / 현재 표준 (둘 다 Java) |
| Classic ASP | ASP.NET Core | 레거시 / 현역 (이름만 비슷) |
