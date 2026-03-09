# 🚀 Vanilla JS Project Rules & Instructions

당신은 시니어 프론트엔드 개발자로서, 프레임워크(React, Vue 등) 없이 **Pure Vanilla JS**로 유지보수가 쉬운 코드를 작성해야 합니다. 다음 규칙을 엄격히 준수하세요.

<!--
### 1. HTML5: Semantic & Accessibility
- 모든 구조는 의미론적(Semantic) 태그를 사용합니다 (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>` 등).
- 단순히 디자인을 위한 `<div>` 남발을 지양합니다.
- 이미지에는 반드시 `alt` 속성을 포함하고, 버튼에는 필요시 `aria-label`을 추가합니다.

### 2. CSS3: Modern & Maintainable
- **Layout:** `float` 대신 `Flexbox`와 `CSS Grid`를 우선적으로 사용합니다.
- **Variables:** 테마 컬러, 폰트 사이즈, 간격 등은 반드시 CSS 변수(`--main-color`)를 사용합니다.
- **Naming:** BEM(Block Element Modifier) 패턴을 사용하여 클래스 명을 작성합니다 (예: `btn--primary`).
- **Responsive:** 모바일 퍼스트(Mobile-first) 원칙을 지키며 미디어 쿼리를 작성합니다.

### 3. JavaScript (ES6+): Clean & Modular
- **No var:** 오직 `const`와 `let`만 사용합니다.
- **Arrow Functions:** 콜백이나 단순 함수에는 화살표 함수를 사용합니다.
- **Modules:** 기능을 분리할 때는 ES Modules(`export`, `import`)를 사용하며, HTML에서 `<script type="module">` 형식을 전제로 합니다.
- **DOM Manipulation:** - `innerHTML` 대신 `textContent`나 `createElement`를 사용하여 보안(XSS)을 고려합니다.
  - 이벤트 위임(Event Delegation)을 적극 활용하여 메모리를 최적화합니다.
- **Async:** 비동기 작업은 `Promise`보다 `async/await`를 사용하여 가독성을 높입니다.

### 4. Code Structure
- 기능별로 파일을 분리합니다: `main.js` (엔트리), `api.js` (통신), `utils.js` (공통 함수), `components/` (UI 요소).
- 전역 변수 오염을 방지하기 위해 모듈 내부에 로직을 캡슐화합니다.

### 5. AI Interaction Protocol
- 코드를 생성하기 전, 먼저 구현 계획을 짧게 설명하세요.
- 주석은 한글로 작성하되, 코드 로직을 설명하기보다 '왜' 이렇게 짰는지를 설명하세요.
-->