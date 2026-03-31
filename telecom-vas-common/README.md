# 통신사 부가서비스 공통 가입 화면 (Telecom VAS Common)

## 📌 프로젝트 소개
본 프로젝트는 **'전화번호 안심로그인(SafeConnect)'** 유료 부가서비스 가입을 위한 공통 웹 프론트엔드입니다.
SKT, KT, LGU+ 이동통신 3사 및 알뜰폰 사용자를 대상으로 직관적이고 안전한 가입 플로우를 제공하기 위해 설계되었습니다.

## 🛠 주요 기능
- **통신사 선택 및 제어**: SKT, KT, LGU+ 각 통신사별 입력 폼 제어 (SKT는 주민등록번호 7자리 추가 입력 필요)
- **인증 폼 상태 관리**: `AUTH_FORM_STATE` 상수와 `setAuthFormState()` 함수로 3가지 상태 제어
- **개인정보 및 약관 동의**: 전체 동의 및 개별 약관 팝업 연동, 약관 목록 펼침/접힘 토글
- **본인 인증 플로우**:
  - 휴대폰 번호 유효성 검사
  - 인증번호 6자리 전송 및 타이머(3분) 제어
- **보안 강화**: Google reCAPTCHA v2 (Invisible) 연동을 통한 봇 방지
- **커스텀 UI 컴포넌트**: 모달 팝업(Alert, Confirm, 안내), 토스트 메시지, 로딩 오버레이

## 🗂 프로젝트 구조
```text
telecom-vas-common/
├── vas-common.html             # 서비스 가입 메인 화면 (Entry Point)
├── README.md                   # 프로젝트 문서
├── ai/
│   └── PROMPTS.md              # 개발 가이드라인
└── assets/
    ├── css/
    │   ├── reset.css           # 브라우저 기본 스타일 초기화 (최우선 적용)
    │   ├── vas-common.css      # 레이아웃 및 전체 디자인 스타일
    │   └── vas-common-custom.css # 서비스별 오버라이드 스타일 (최후 적용)
    ├── js/
    │   └── vas-common.js       # 폼 검증, 인증 플로우, 모달/토스트 제어 핵심 로직
    └── images/
        ├── SKT_ON.png          # 통신사 선택 로고 (SKT)
        ├── KT_ON.png           # 통신사 선택 로고 (KT)
        ├── LGT_ON.png          # 통신사 선택 로고 (LGU+)
        ├── banners/            # 상·하단 프로모션 배너 이미지
        └── temp/               # 서비스 기능 소개 아이콘 (임시)
```

## 🎨 CSS 파일 구조

CSS는 아래 순서로 적용되며, 뒤에 올수록 우선순위가 높습니다.

| 파일 | 역할 |
|------|------|
| `reset.css` | 브라우저 기본 스타일 초기화 (box-sizing, tap-highlight, font-smoothing 등) |
| `vas-common.css` | 공통 레이아웃 및 컴포넌트 스타일. HTML 요소 순서에 맞게 6개 섹션으로 구성 |
| `vas-common-custom.css` | 서비스별 디자인 오버라이드 및 추가 스타일 작성 공간 |

### vas-common.css 섹션 구성

```
1. 전역 설정         — :root 변수, body, .bg-test
2. 페이지 구조       — .vas-container, .advertiser-notice, .vas-header
3. 가입 입력 섹션    — service-desc → service-intro → subscription-banner
                       → subscription-form → carrier-select → terms-panel
                       → 입력 공통 → phone-auth-form → service-features
                       → subscription-bottom → promo-banner → billing-info
4. 가입 완료 섹션    — html.complete, .complete-panel
5. 푸터              — .vas-footer, .hide-setting
6. UI 공통 컴포넌트  — dim, loading, toast, modal-side, alert, table, privacy layer
```

## 🧱 HTML 구조 (주요 클래스)
```
.vas-container
├── .advertiser-notice          # 광고주 안내 바
├── .vas-header                 # 상단 헤더 (서비스명)
└── main.vas-content
    ├── #sectionInput           # 가입 입력 섹션
    │   ├── .service-desc       # 서비스 설명
    │   ├── .service-intro      # 서비스 소개
    │   ├── .subscription-banner # 상단 배너
    │   ├── .subscription-form
    │   │   ├── .carrier-select  # 통신사 선택 (SKT / KT / LGU+)
    │   │   ├── .terms-panel     # 약관 동의 패널
    │   │   └── .phone-auth-form # 휴대폰 인증 폼
    │   └── .subscription-bottom
    │       ├── .subscribe-footer # 가입 버튼
    │       ├── .promo-banner     # 하단 배너
    │       └── .billing-info     # 요금 안내
    └── #sectionComplete        # 가입 완료 섹션
```

## ⚙️ 인증 폼 상태 관리

통신사에 따라 주민등록번호 입력란 유무가 달라지며, `AUTH_FORM_STATE` 상수로 3가지 상태를 관리합니다.

### 상태 정의

| 상수 | 클래스 | 적용 조건 |
|------|--------|-----------|
| `AUTH_FORM_STATE.DEFAULT` | _(없음)_ | 기본 상태 |
| `AUTH_FORM_STATE.WITH_JUMIN` | `with-jumin` | SKT 선택 시 |
| `AUTH_FORM_STATE.WITHOUT_JUMIN` | `without-jumin` | KT / LGU+ 선택 시 |

### 초기 상태 설정

```js
// true: 초기 디폴트 상태 유지 (클래스 없음)
// false: 초기부터 without-jumin 상태 적용
const AUTH_FORM_DEFAULT_STATE = true;
```

### 스크립트에서 직접 상태 변경

```js
setAuthFormState(AUTH_FORM_STATE.DEFAULT);        // 기본 상태
setAuthFormState(AUTH_FORM_STATE.WITH_JUMIN);     // 주민등록번호 입력란 표시 (SKT)
setAuthFormState(AUTH_FORM_STATE.WITHOUT_JUMIN);  // 주민등록번호 입력란 없음 (KT, LGU+)
```

## 💻 사용 기술 (Tech Stack)
- **Markup / Styling**: HTML5, CSS3 (일관된 kebab-case 네이밍)
- **Script**: Vanilla JavaScript (ES6+)
- **Security**: Google reCAPTCHA v2 API

## 🚀 시작하기 (Getting Started)
별도의 빌드 과정 없이 `vas-common.html`을 로컬 서버에서 실행합니다.

```bash
# VSCode Live Server 또는 간단한 HTTP 서버 사용
npx serve .
```

> **유의사항**: Google reCAPTCHA는 `file://` 프로토콜에서 정상 작동하지 않을 수 있으므로
> 로컬 웹 서버 환경(localhost)에서의 구동을 권장합니다.
