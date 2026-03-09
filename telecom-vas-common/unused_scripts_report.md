# index.js 내 사용되지 않는 스크립트 분석 보고서

[index.js](file:///Users/takoong/work/aton-local/telecom-vas-common/assets/js/index.js) 파일을 분석한 결과, 논리적으로 사용되지 않거나(Dead Code) 기능상 불필요한 스크립트 요소들을 다음과 같이 확인하였습니다.

## 1. 사용되지 않는 변수 및 선택자
- **`btnRetry` (line 34, 47)**
  - **정의:** `const btnRetry = document.querySelector('.btn-sub-action:not(.btn-phone-confirm)');`
  - **이유:** 현재 [index.html](file:///Users/takoong/work/aton-local/telecom-vas-common/index.html)에는 `.btn-sub-action` 클래스를 가지면서 `.btn-phone-confirm` 클래스가 없는 요소가 존재하지 않습니다. (관련 버튼이 주석 처리되었거나 누락됨)
  - **결과:** 해당 변수는 항상 `null`이며, 47행의 `btnRetry.classList.add('disabled')` 코드는 실행되지 않습니다. 또한 이 변수에 연결된 이벤트 리스너도 없습니다.

## 2. 사용되지 않는 함수 매개변수
- **[privacyPopOpen](file:///Users/takoong/work/aton-local/telecom-vas-common/assets/js/index.js#551-562) 함수의 `code` 매개변수 (line 555)**
  - **정의:** `window.privacyPopOpen = function(code) { ... }`
  - **이유:** [index.html](file:///Users/takoong/work/aton-local/telecom-vas-common/index.html)에서 각 약관 클릭 시 서로 다른 코드('0001', '0003' 등)를 인자로 넘겨주고 있으나, 함수 내부에서는 이 `code` 값을 전혀 참조하지 않고 항상 고정된 `privacy01` 팝업만 노출합니다.
  - **결과:** 다양한 약관 내용을 분기 처리하려는 의도로 설계되었으나 현재는 기능적으로 무의미한 매개변수입니다.

## 3. 스크립트에서 참조하지 않는 가용 요소 (Dead HTML Reference)
[index.js](file:///Users/takoong/work/aton-local/telecom-vas-common/assets/js/index.js)의 로직상 더 이상 사용되지 않거나 참조가 빠진 HTML 요소들입니다.

- **미사용 팝업 ID:**
  - `ktModal` (line 286 in HTML)
  - `popupCont06`, `popupCont07`, `popupCont09` (line 319, 338, 375 in HTML)
- **이벤트 리스너 누락 클래스:**
  - `.sendSMS`, `.checkAuth` (HTML 내의 버튼들이나 [index.js](file:///Users/takoong/work/aton-local/telecom-vas-common/assets/js/index.js)에 관련 핸들러 없음)

## 4. 기타 검토 사항
그 외 [index.js](file:///Users/takoong/work/aton-local/telecom-vas-common/assets/js/index.js) 내의 주요 함수([showLoading](file:///Users/takoong/work/aton-local/telecom-vas-common/assets/js/index.js#15-24), [startTimer](file:///Users/takoong/work/aton-local/telecom-vas-common/assets/js/index.js#427-445), [processPhoneAuth](file:///Users/takoong/work/aton-local/telecom-vas-common/assets/js/index.js#222-252) 등)와 전역 변수들은 모두 실제 비즈니스 로직 및 UI 인터랙션에 정상적으로 사용되고 있음을 확인하였습니다.
