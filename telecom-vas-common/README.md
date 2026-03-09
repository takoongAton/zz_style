# 통신사 부가서비스 공통 가입 화면 (Telecom VAS Common)

## 📌 프로젝트 소개
본 프로젝트는 **'전화번호 안심로그인(SafeConnect)'** 유료 부가서비스 가입을 위한 공통 웹 프론트엔드입니다. 
SKT, KT, LGU+ 이동통신 3사 및 알뜰폰 사용자를 대상으로 직관적이고 안전한 가입 플로우를 제공하기 위해 설계되었습니다.

## 🛠 주요 기능
- **통신사 선택 및 제어**: SKT, KT, LGU+ 등 각 통신사별로 필요한 입력 폼(예: SKT 주민등록번호 7자리 요구) 제어
- **개인정보 및 약관 동의**: 전체 동의 및 개별 약관 팝업 연동, 약관 목록 펼침/접힘 토글 기능
- **본인 인증 플로우**:
  - 휴대폰 번호 유효성 검사 및 하이픈 자동 변환
  - 인증번호 6자리 전송 및 타이머(3분) 제어 로직
- **보안 강화**: Google reCAPTCHA(Invisible) 연동을 통한 어뷰징(Bot) 방지
- **커스텀 UI 컴포넌트**: 
  - 다양한 형태의 모달 팝업(Alert, Confirm, 안내) 및 토스트(Toast) 메시지 알림
  - '7일간 보이지 않기' 기능 구현 (localStorage 활용)

## 🗂 프로젝트 구조
```text
telecom-vas-common/
├── index.html                  # 서비스 가입 메인 화면 (Entry Point)
├── README.md                   # 프로젝트 문서
└── assets/
    ├── css/
    │   ├── reset.css           # 브라우저 기본 스타일 초기화
    │   ├── common.css          # 프로젝트 전역 공통 스타일
    │   └── sfconn_design.css   # 해당 가입 페이지의 핵심 레이아웃 및 디자인
    ├── images/                 
    │   ├── SKT_ON.png          # 통신사 선택 로고 (SKT)
    │   ├── KT_ON.png           # 통신사 선택 로고 (KT)
    │   ├── LGT_ON.png          # 통신사 선택 로고 (LGU+)
    │   └── banners/            # 프로모션 및 상/하단 배너 이미지 리소스
    └── js/
        └── index.js            # 입력 폼 검증, reCAPTCHA, 모달/토스트 제어 등 핵심 로직
```

## 💻 사용 기술 (Tech Stack)
- **Markup/Styling**: HTML5, CSS3 
- **Script**: Vanilla JavaScript (ES6+)
- **Security**: Google reCAPTCHA v2 API

## 🚀 시작하기 (Getting Started)
별도의 빌드 과정 없이, 프로젝트 폴더 내의 `index.html` 파일을 로컬 서버(예: VSCode Live Server, Express 등)에 띄우거나 브라우저에서 직접 열어 확인할 수 있습니다.
* **유의사항**: Google reCAPTCHA는 `file://` 프로토콜에서는 간혹 정상 작동하지 않을 수 있으므로 로컬 웹 서버 환경(localhost)에서의 구동을 권장합니다.
