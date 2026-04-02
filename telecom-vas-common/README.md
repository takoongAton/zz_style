# 통신사 부가서비스 공통 가입 화면 (Telecom VAS Common)

## 📌 프로젝트 소개
본 프로젝트는 **'전화번호 안심로그인(SafeConnect)'** 유료 부가서비스 가입을 위한 공통 웹 프론트엔드입니다.
SKT, KT, LGU+ 이동통신 3사 및 알뜰폰 사용자를 대상으로 직관적이고 안전한 가입 플로우를 제공하기 위해 설계되었습니다.

## 🛠 주요 기능
- **통신사 선택 및 제어**: SKT, KT, LGU+ 각 통신사별 입력 폼 제어 (SKT는 주민등록번호 7자리 추가 입력 필요)
- **인증 폼 상태 관리**: `AUTH_FORM_STATE` 상수와 `setAuthFormState()` 함수로 3가지 상태 제어
- **개인정보 및 약관 동의**: 전체 동의 및 개별 약관 팝업 연동, 약관 목록 펼침/접힘 토글
- **KT MVNO 추가 약관 동의**: KT 선택 시 인증번호 발송 전 알뜰폰 이용자 대상 추가 약관 동의 팝업(`#kt-mvno-layer`) 자동 노출
- **본인 인증 플로우**:
  - 휴대폰 번호 유효성 검사
  - 인증번호 6자리 전송 및 타이머(3분) 제어
- **보안 강화**: Google reCAPTCHA v2 (Invisible) 연동을 통한 봇 방지
- **커스텀 UI 컴포넌트**: 모달 팝업(Alert, Confirm, 안내), 토스트 메시지, 로딩 오버레이

## 🗂 프로젝트 구조
```text
telecom-vas-common/
├── vas-common.html                  # 전화번호 안심로그인 (Entry Point)
├── vas-common_infosafebox.html      # 인포세이프박스 서비스
├── vas-common_passcoupon.html       # 패스쿠폰 서비스
├── vas-common_phonsafe_01.html      # 휴대폰 안심 서비스 (타입 01)
├── vas-common_phonsafe_02.html      # 휴대폰 안심 서비스 (타입 02)
├── vas-common_safeconnect_01.html   # 세이프커넥트 서비스 (타입 01)
├── vas-common_safeconnect_02.html   # 세이프커넥트 서비스 (타입 02)
├── vas-common_safetyfam.html        # 세이프티팸 서비스
├── README.md                        # 프로젝트 문서
├── ai/
│   └── PROMPTS.md                   # 개발 가이드라인
└── assets/
    ├── css/
    │   ├── reset.css                # 브라우저 기본 스타일 초기화 (최우선 적용)
    │   ├── vas-common.css           # 레이아웃 및 전체 디자인 스타일
    │   └── vas-common-custom.css    # 서비스별 오버라이드 스타일 (최후 적용)
    ├── js/
    │   └── vas-common.js            # 폼 검증, 인증 플로우, 모달/토스트 제어 핵심 로직
    └── images/
        ├── SKT_ON.png               # 통신사 선택 로고 (SKT)
        ├── KT_ON.png                # 통신사 선택 로고 (KT)
        ├── LGT_ON.png               # 통신사 선택 로고 (LGU+)
        ├── banners/                 # 상·하단 프로모션 배너 이미지
        └── temp/                    # 서비스 기능 소개 아이콘 (임시)
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
6. UI 공통 컴포넌트  — dim, loading, toast, modal-side, alert, table,
                       .terms-layer (약관 팝업 컴포넌트), KT MVNO 팝업
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

[팝업 레이어]
├── .modal-side                 # 확인/알림 팝업 (약관 유도, 가입 완료, 종료 확인 등)
├── .layer.alert                # Alert 팝업
├── .layer.signUp_kt            # KT 유료 가입 안내 팝업
├── .terms-layer#privacy01      # 개인정보 제3자 제공동의 팝업 (BEM 컴포넌트)
├── #kt-mvno-layer              # KT MVNO 추가 약관 동의 팝업
└── .app-download               # 앱 다운로드 유도 영역
```

## 🧩 UI 컴포넌트

### `.terms-layer` — 약관 팝업 (BEM 컴포넌트)

개인정보 처리방침 및 서비스 이용약관 표시용 전체화면 팝업 컴포넌트.
여러 약관에 공통으로 재사용하며, `id`로 각 약관을 구분합니다.

```html
<div class="terms-layer" id="privacy01" style="display:none;">
    <div class="terms-layer__inner">
        <div class="terms-layer__header">
            <h2 class="terms-layer__title">약관 제목</h2>
            <button type="button" class="terms-layer__close"><span>닫기</span></button>
        </div>
        <div class="terms-layer__body">
            <div class="terms-layer__content">약관 내용</div>
        </div>
        <div class="terms-layer__footer">
            <button type="button" class="terms-layer__btn-confirm"><span>확인</span></button>
        </div>
    </div>
</div>
```

| 요소 | 클래스 |
|------|--------|
| 컴포넌트 루트 | `.terms-layer` |
| 내부 래퍼 | `.terms-layer__inner` |
| 헤더 | `.terms-layer__header` |
| 제목 | `.terms-layer__title` |
| 닫기 버튼 | `.terms-layer__close` |
| 본문 | `.terms-layer__body` |
| 약관 선택 드롭다운 | `.terms-layer__select` |
| 텍스트 영역 | `.terms-layer__content` |
| 푸터 | `.terms-layer__footer` |
| 확인 버튼 | `.terms-layer__btn-confirm` |

JS에서 열기:
```js
window.privacyPopOpen = function(code) { ... }  // 글로벌 함수로 HTML에서 직접 호출
```

---

### `#kt-mvno-layer` — KT MVNO 추가 약관 동의 팝업

KT 통신사 선택 후 인증번호 발송 직전에 자동으로 노출됩니다.
알뜰폰(MVNO) 이용자의 개인정보 제3자 제공 동의를 받기 위한 팝업입니다.

**노출 조건**: 통신사 KT 선택 + 필수 약관 전체 동의 완료 후
**동의 버튼 클릭 시**: 팝업 닫힘 → `processPhoneAuth()` 실행 (인증번호 발송)
**닫기(X) 클릭 시**: 팝업 닫힘, 인증번호 발송 안 함

```html
<div id="kt-mvno-layer">
    <div class="kt-mvno-inner">
        <div class="kt-mvno-header"> ... </div>
        <div class="kt-mvno-body">
            <p class="kt-mvno-checkbox"> ... </p>
            <div class="kt-mvno-terms"> ... </div>
        </div>
        <div class="kt-mvno-footer">
            <div class="kt-mvno-actions">
                <button id="btnKtMvnoSubmit">동의 후 인증번호 요청</button>
            </div>
        </div>
    </div>
</div>
```

---

### `.modal-side` — 확인/알림 팝업 (BEM 컴포넌트)

약관 유도, 가입 완료 안내, 종료 확인, 인증 결과 등 다목적 소형 팝업.
`label`(카테고리)과 `title`(제목)은 필수, `desc`(설명)는 선택적으로 사용합니다.

```html
<!-- desc 없는 경우 (label + title만) -->
<div class="modal-side" id="exitPopup">
    <div class="modal-side__content">
        <p class="modal-side__label">개인정보 보호 서비스</p>
        <p class="modal-side__title">가입 진행을 종료하시겠습니까?</p>
    </div>
    <div class="modal-side__footer">
        <button type="button" class="btn modal-side__btn-cancel" id="btnExitCancel"><span>취소</span></button>
        <button type="button" class="btn modal-side__btn-confirm" id="btnExitConfirm"><span>확인</span></button>
    </div>
</div>

<!-- desc 있는 경우 (label + title + desc) -->
<div class="modal-side" id="sidePopup2">
    <div class="modal-side__content">
        <p class="modal-side__label">서비스 가입 완료</p>
        <p class="modal-side__title">서비스명 서비스 가입 안내</p>
        <p class="modal-side__desc">사이트의 아이디/비밀번호를 스마트폰 USIM에 보관하고...</p>
    </div>
    <div class="modal-side__footer">
        <button type="button" class="btn modal-side__btn-confirm" id="btnSideConfirm2"><span>확인</span></button>
    </div>
</div>
```

| 요소 | 클래스 | 필수 여부 |
|------|--------|-----------|
| 컴포넌트 루트 | `.modal-side` | 필수 |
| 콘텐츠 래퍼 | `.modal-side__content` | 필수 |
| 카테고리 라벨 | `.modal-side__label` | 필수 |
| 제목 | `.modal-side__title` | 필수 |
| 설명 | `.modal-side__desc` | 선택 |
| 버튼 영역 | `.modal-side__footer` | 필수 |
| 취소 버튼 | `.modal-side__btn-cancel` | 선택 |
| 확인 버튼 | `.modal-side__btn-confirm` | 필수 |

팝업 활성화 시 `.active` 클래스를 추가합니다:
```js
document.getElementById('exitPopup').classList.add('active');
```

**프로젝트 내 사용 팝업 목록**

| ID | label | title | desc |
|----|-------|-------|------|
| `#sidePopup` | 서비스 이용 | 필수 약관 동의 후 다음 단계를 진행하겠습니까? | ✗ |
| `#sidePopup2` | 서비스 가입 완료 | 서비스명 서비스 가입 안내 | ✓ (서비스별 상이) |
| `#exitPopup` | 개인정보 보호 서비스 | 가입 진행을 종료하시겠습니까? | ✗ |
| `#authFailPopup` | 인증번호 발송 실패 | 통신사 또는 휴대폰 번호를 확인해주세요. | ✗ |
| `#authSuccessPopup` | 인증번호 발송 완료 | 입력하신 번호로 인증번호가 발송되었습니다. | ✗ |

---

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

## 🔄 인증번호 발송 플로우

```
확인 버튼 클릭
    ├─ 통신사 미선택 → 토스트 안내
    ├─ 입력 자리수 부족 → 토스트 안내
    ├─ 재요청 모드 (타이머 진행 중) → 토스트 안내
    ├─ 필수 약관 미동의 → sidePopup 노출
    ├─ KT 선택 + 약관 동의 완료 → #kt-mvno-layer 노출
    │       └─ 동의 버튼 클릭 → processPhoneAuth()
    └─ KT 외 + 약관 동의 완료 → processPhoneAuth()
                └─ reCAPTCHA 실행 → executePhoneAuthLogic()
                        └─ 인증번호 발송 + 타이머 시작
```

## 💻 사용 기술 (Tech Stack)
- **Markup / Styling**: HTML5, CSS3 (일관된 kebab-case 네이밍, BEM 부분 적용)
- **Script**: Vanilla JavaScript (ES6+)
- **Security**: Google reCAPTCHA v2 API

## 🚀 시작하기 (Getting Started)
별도의 빌드 과정 없이 각 HTML 파일을 로컬 서버에서 실행합니다.

```bash
# VSCode Live Server 또는 간단한 HTTP 서버 사용
npx serve .
```

> **유의사항**: Google reCAPTCHA는 `file://` 프로토콜에서 정상 작동하지 않을 수 있으므로
> 로컬 웹 서버 환경(localhost)에서의 구동을 권장합니다.
