/**
 * ============================================================
 * vas-common-junior.js
 * ============================================================
 * 이 파일은 vas-common.js의 주니어 개발자용 학습 버전입니다.
 * 실제 동작 코드는 동일하고, 주석을 최대한 자세하게 작성했습니다.
 *
 * 이 파일이 담당하는 기능 목록:
 *   1. Google reCAPTCHA 초기화
 *   2. 방문/가입 통계 추적 (localStorage)
 *   3. 통신사 선택에 따른 폼 상태 변환
 *   4. 휴대폰 번호 / 주민등록번호 입력 검증
 *   5. 약관 동의 체크박스 제어
 *   6. 인증번호 발송 및 타이머
 *   7. 최종 가입 처리
 *   8. 팝업 / 토스트 / 툴팁 등 UI 유틸리티
 *   9. 7일간 숨기기 기능
 *  10. iOS Safari 뷰포트 버그 대응
 * ============================================================
 */


/* ============================================================
 * [1] Google reCAPTCHA 초기화
 * ============================================================
 * reCAPTCHA란? 봇(자동화 프로그램)이 폼을 악용하는 것을 막기 위해
 * Google이 제공하는 보안 서비스입니다.
 *
 * 'invisible' 사이즈: 사용자에게 체크박스가 보이지 않고,
 * 백그라운드에서 자동으로 사람인지 봇인지 판별합니다.
 *
 * onloadCallback은 reCAPTCHA 스크립트가 로드된 직후
 * 자동으로 호출되는 함수입니다.
 * HTML의 script src에 ?onload=onloadCallback 파라미터로 연결됩니다.
 * ============================================================ */
const onloadCallback = function() {
	// 'greCaptcha'라는 id를 가진 요소가 HTML에 있을 때만 초기화
	// (일부 페이지에는 reCAPTCHA 요소가 없을 수 있으므로 존재 여부 먼저 확인)
	if (document.getElementById('greCaptcha')) {
		grecaptcha.render(
			'greCaptcha', {
				'sitekey' : "6LfQHq4UAAAAALRMMx1RbrsoU_XdapEc8Ocv5fHM", // Google에서 발급받은 사이트 키
				'size' : 'invisible',          // 사용자에게 보이지 않는 invisible 모드
				'callback' : executePhoneAuthLogic, // 검증 성공 시 호출할 함수
				'badge' : 'bottomright'        // reCAPTCHA 배지 위치
			}
		);
	}
};


/* ============================================================
 * [2] 로딩 스피너 표시 함수
 * ============================================================
 * 서버와 통신하는 동안 화면에 로딩 스피너를 보여줍니다.
 * 현재는 실제 서버가 없으므로 setTimeout으로 1초를 시뮬레이션합니다.
 *
 * callback 매개변수: 로딩이 끝난 후 실행할 함수를 전달받습니다.
 *   예) showLoading(() => { console.log('로딩 끝!'); });
 * ============================================================ */
function showLoading(callback) {
	const loadingOverlay = document.getElementById('loadingOverlay');

	// 로딩 오버레이 표시 (CSS에서 .active 클래스가 있으면 보임)
	if (loadingOverlay) loadingOverlay.classList.add('active');

	// 1000ms(1초) 뒤에 로딩을 숨기고, 전달받은 callback 함수를 실행
	setTimeout(() => {
		if (loadingOverlay) loadingOverlay.classList.remove('active');
		if (callback) callback(); // callback이 있을 때만 실행 (null 방지)
	}, 1000);
}


/* ============================================================
 * [3] 방문/가입 통계 관리 모듈 (localStorage 기반)
 * ============================================================
 * localStorage란? 브라우저에 데이터를 영구적으로 저장하는 공간입니다.
 * 서버 없이도 사용자 브라우저에 정보를 저장할 수 있습니다.
 * (창을 닫아도 데이터가 유지됨)
 *
 * 이 모듈은 날짜별로 방문(visit)과 가입(signup) 횟수를 기록합니다.
 * 저장 형태 예시:
 *   { "2025-04-01": { visit: 3, signup: 1 }, "2025-04-02": { visit: 5 } }
 * ============================================================ */
const StatisticsManager = {
	// localStorage에서 사용할 키 이름 (고정값)
	STORAGE_KEY: 'safeconnect_stats',

	// 오늘 날짜를 'YYYY-MM-DD' 형식 문자열로 반환
	// padStart(2, '0'): 한 자리 숫자를 두 자리로 맞춤 (예: 4 → '04')
	getToday: function() {
		const d = new Date();
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	},

	// localStorage에서 전체 통계 객체를 가져옴
	// 데이터가 없으면 빈 객체 {} 반환
	// JSON.parse: 문자열로 저장된 데이터를 JavaScript 객체로 변환
	getStats: function() {
		const stats = localStorage.getItem(this.STORAGE_KEY);
		return stats ? JSON.parse(stats) : {};
	},

	// 특정 항목(key)의 카운트를 1 증가시켜 저장
	// key 예시: 'visit', 'signup'
	track: function(key) {
		const stats = this.getStats();
		const today = this.getToday();

		// 오늘 날짜 데이터가 없으면 초기값으로 생성
		if (!stats[today]) {
			stats[today] = { visit: 0, signup: 0 };
		}

		// 해당 항목 카운트 +1 (없으면 0으로 시작)
		stats[today][key] = (stats[today][key] || 0) + 1;

		// JSON.stringify: JavaScript 객체를 문자열로 변환하여 저장
		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
		console.log(`[Stats] Tracked ${key} for ${today}:`, stats[today]);
	}
};

// 페이지가 로드될 때마다 방문 횟수를 1 증가시킴
StatisticsManager.track('visit');


/* ============================================================
 * [4] DOM 요소 선택 및 전역 변수 설정
 * ============================================================
 * document.querySelector: CSS 선택자로 HTML 요소 1개를 가져옴
 * document.querySelectorAll: 조건에 맞는 모든 요소를 NodeList로 가져옴
 * document.getElementById: id로 요소를 가져옴 (querySelector보다 빠름)
 *
 * 여기서 한 번 선택해 두고, 아래 여러 곳에서 재사용합니다.
 * 매번 querySelector를 호출하면 성능에 불리하기 때문입니다.
 * ============================================================ */

// 인증번호 입력 영역 전체 래퍼 (처음엔 숨겨져 있다가 인증번호 발송 후 펼쳐짐)
let auth_wrap = document.querySelector("#otp-field-wrap");

// 휴대폰 번호 입력 필드 (단, 주민등록번호 입력 필드는 제외)
// :not(#juminNumber) → id가 juminNumber인 input은 제외하는 CSS 선택자
const phoneInput = document.querySelector('input[type="tel"]:not(#juminNumber)');

// 주민등록번호 입력 필드 (SKT 전용, 없는 페이지에서는 null)
const juminInput = document.querySelector('#juminNumber');

// 인증번호(OTP) 입력 필드
const authInput = document.querySelector('#otp-field-wrap input');

// 최종 가입 버튼 (하단의 '전화번호 안심로그인 유료가입' 버튼)
const primaryBtn = document.querySelector('.btn-subscribe');

// 인증번호 남은 시간을 표시하는 요소 (예: "02:45")
const timerDisplay = document.querySelector(".otp-timer");

// 인증번호 재요청 버튼 (인증번호 타이머 만료 후 활성화됨)
const btnRetry = document.querySelector('.btn-action:not(.btn-send-otp)');

// 휴대폰 번호 옆 '확인' 버튼 (인증번호 발송 요청 버튼)
const btnPhoneConfirm = document.querySelector('.btn-send-otp');

// 인증번호 입력 옆 도움말(?) 아이콘 버튼
const btnHelp = document.querySelector(".btn-otp-help");

// 도움말 툴팁 (도움말 아이콘 클릭 시 나타나는 말풍선)
const helpTooltip = document.querySelector(".otp-tooltip");

// 딤(dim) 오버레이: 팝업 뒤에 깔리는 반투명 어두운 배경
const dimOverlay = document.querySelector('.dim');

// ---- 상태 관리 변수 ----
let isAuthRequested = false; // 인증번호를 이미 요청했는지 여부 (true: 요청 완료)
let timerInterval = null;    // setInterval이 반환하는 ID값 (나중에 clearInterval로 타이머를 멈출 때 사용)
let timeLeft = 180;          // 인증번호 입력 가능 시간 (초 단위, 3분 = 180초)


/* ============================================================
 * [5] 초기 상태 설정
 * ============================================================ */
// 페이지 로드 시 인증번호 재요청 버튼을 비활성화 상태로 시작
// (처음엔 인증번호를 보낸 적이 없으므로 재요청 버튼이 보일 필요 없음)
if (btnRetry) btnRetry.classList.add('disabled');


/* ============================================================
 * [6] 확인 버튼 활성화 상태 업데이트 함수
 * ============================================================
 * '확인' 버튼(.btn-send-otp)은 조건을 충족해야만 활성화됩니다.
 *   - 기본 조건: 휴대폰 번호 11자리 입력 완료
 *   - SKT 선택 + juminInput이 DOM에 있을 때: 주민등록번호 8자리(6자리+하이픈+1자리)도 완료
 *
 * 이 함수는 입력값이 바뀔 때마다 호출되어 버튼 상태를 갱신합니다.
 * ============================================================ */
function updatePhoneConfirmBtnState() {
	// 현재 선택된 통신사 라디오 버튼을 가져옴
	const selectedTelecom = document.querySelector('input[name="telCdRadio"]:checked');

	// SKT가 선택되어 있는지 여부 (boolean)
	// && 연산자: selectedTelecom이 null이면 false, 있으면 value 비교
	const isSktSelected = selectedTelecom && selectedTelecom.value === 'SKT';

	// 기본 유효성: 휴대폰 번호가 11자리인가?
	let isValid = phoneInput && phoneInput.value.length === 11;

	// SKT이고 주민등록번호 필드가 DOM에 실제로 존재할 때만 추가 검사
	// juminInput이 null이면(주석처리된 페이지) 이 블록은 실행되지 않음
	if (isSktSelected && juminInput) {
		// 주민등록번호는 '710304-0' 형식으로 총 8글자 (6자리 + 하이픈 + 1자리)
		isValid = isValid && juminInput.value.length === 8;
	}

	// 유효하면 버튼에 active 클래스 추가 (CSS에서 활성화 스타일 적용)
	if (isValid) {
		btnPhoneConfirm.classList.add('active');
	} else {
		btnPhoneConfirm.classList.remove('active');
	}
}


/* ============================================================
 * [7] 입력 필드 이벤트 핸들링
 * ============================================================
 * 사용자가 입력 필드에 타이핑할 때마다 'input' 이벤트가 발생합니다.
 * ?. (옵셔널 체이닝): 요소가 null이면 에러 없이 그냥 넘어감
 *   예) phoneInput?.addEventListener → phoneInput이 null이어도 오류 없음
 * ============================================================ */

// 휴대폰 번호 입력 이벤트
phoneInput?.addEventListener('input', function() {
	// 인증번호 발송 후 타이머가 진행 중이면 추가 입력을 막음
	if (isAuthRequested && timeLeft > 0) return;

	// 숫자 이외의 문자를 모두 제거 (정규식: [^0-9]는 숫자가 아닌 문자)
	this.value = this.value.replace(/[^0-9]/g, '');

	// 입력값이 바뀌었으므로 버튼 상태를 다시 계산
	updatePhoneConfirmBtnState();
});

// 주민등록번호 입력 이벤트 (juminInput이 있는 페이지에서만 등록)
if (juminInput) {
	juminInput.addEventListener('input', function() {
		// 인증번호 발송 후 타이머 진행 중이면 입력 차단
		if (isAuthRequested && timeLeft > 0) return;

		// 숫자만 추출
		let val = this.value.replace(/[^0-9]/g, '');

		// 6자리 이상이면 7번째 자리 앞에 하이픈(-) 자동 삽입
		// 예: '7103040' → '710304-0'
		if (val.length > 6) {
			val = val.substring(0, 6) + '-' + val.substring(6, 7);
		}

		this.value = val;
		updatePhoneConfirmBtnState();
	});
}

// 인증번호(OTP) 입력 이벤트
authInput?.addEventListener('input', function() {
	// 숫자만 허용
	this.value = this.value.replace(/[^0-9]/g, '');
});


/* ============================================================
 * [8] 인증 폼 상태 정의 및 관리
 * ============================================================
 * 통신사에 따라 폼의 모양이 달라집니다.
 *   - SKT: 주민등록번호 입력란 있음 → 확인 버튼이 주민번호 행 오른쪽에 위치
 *   - KT/LGU+: 주민등록번호 없음 → 확인 버튼이 전화번호 행 오른쪽에 위치
 *
 * AUTH_FORM_STATE 객체: 상태값을 문자열 상수로 관리합니다.
 * 문자열을 직접 쓰면 오타가 생길 수 있어서, 상수로 정의해두고 사용합니다.
 *   나쁜 예) if (state === 'with-jumin')    → 오타 발생 가능
 *   좋은 예) if (state === AUTH_FORM_STATE.WITH_JUMIN) → 안전
 *
 * AUTH_FORM_DEFAULT_STATE: 각 HTML 파일 하단 <script>에서 선언합니다.
 *   - true : 통신사 선택과 무관하게 항상 기본(DEFAULT) 상태 유지
 *   - false: 통신사 선택에 따라 상태 자동 변환
 * ============================================================ */
const AUTH_FORM_STATE = {
	DEFAULT:       'default',       // 기본 상태 (통신사 미선택)
	WITH_JUMIN:    'with-jumin',    // 주민등록번호 입력란 있는 상태 (SKT)
	WITHOUT_JUMIN: 'without-jumin'  // 주민등록번호 입력란 없는 상태 (KT, LGU+)
};

// 이 변수는 각 HTML 파일 하단에서 선언됩니다.
// 이 줄은 참고용 주석입니다.
// const AUTH_FORM_DEFAULT_STATE = false;

/**
 * 인증 폼 상태를 변환하는 함수
 * @param {string} state - AUTH_FORM_STATE의 값 중 하나
 *
 * 이 함수가 하는 일:
 *   1. DOM에 juminFieldGroup이 없으면 WITH_JUMIN을 WITHOUT_JUMIN으로 교체 (방어 처리)
 *   2. 이전 상태 클래스 제거 및 인라인 스타일 초기화
 *   3. 새 상태 클래스 적용
 *   4. 확인 버튼 위치를 기준 입력 필드에 맞춰 재계산
 */
function setAuthFormState(state) {

	// [방어 처리] juminFieldGroup이 DOM에 없는 페이지(예: safeconnect_01.html)에서
	// WITH_JUMIN 요청이 들어오면, 강제로 WITHOUT_JUMIN으로 바꿉니다.
	// juminFieldGroup은 아래(통신사 선택 로직 섹션)에서 선언됩니다.
	if (state === AUTH_FORM_STATE.WITH_JUMIN && !juminFieldGroup) {
		state = AUTH_FORM_STATE.WITHOUT_JUMIN;
	}

	// 폼 요소와 버튼 래퍼 요소를 가져옴
	const authForm = document.querySelector('.phone-auth-form');
	const btnConfirmWrap = document.getElementById('phone-confirm-wrap');

	// 둘 중 하나라도 없으면 함수 종료 (안전 처리)
	if (!authForm || !btnConfirmWrap) return;

	// 기존에 적용되어 있던 상태 클래스를 모두 제거
	authForm.classList.remove(AUTH_FORM_STATE.WITH_JUMIN, AUTH_FORM_STATE.WITHOUT_JUMIN);
	btnConfirmWrap.classList.remove(AUTH_FORM_STATE.WITH_JUMIN, AUTH_FORM_STATE.WITHOUT_JUMIN);

	// 버튼의 인라인 스타일(위치, 크기)도 초기화
	btnConfirmWrap.style.top    = '';
	btnConfirmWrap.style.height = '';
	btnConfirmWrap.style.width  = '';

	if (state === AUTH_FORM_STATE.WITH_JUMIN) {
		// --- SKT: 버튼을 주민등록번호 입력 행 높이에 맞춤 ---
		authForm.classList.add(state);
		btnConfirmWrap.classList.add(state);

		// requestAnimationFrame: 브라우저가 화면을 다시 그린 직후에 실행
		// 클래스 변경 직후 바로 offsetTop을 읽으면 아직 레이아웃이 반영되지 않을 수 있으므로
		// 다음 프레임까지 기다렸다가 계산합니다.
		requestAnimationFrame(function() {
			const juminInputBox = juminFieldGroup ? juminFieldGroup.querySelector('.input-box') : null;
			if (juminInputBox && authForm) {
				// authForm을 기준으로 juminInputBox까지의 상대 위치(topVal)를 계산
				// offsetParent 체인을 따라 올라가며 offsetTop을 누적합니다.
				let el = juminInputBox, topVal = 0;
				while (el && el !== authForm) {
					topVal += el.offsetTop;
					el = el.offsetParent;
				}
				btnConfirmWrap.style.top    = topVal + 'px';
				btnConfirmWrap.style.height = juminInputBox.offsetHeight + 'px';
				btnConfirmWrap.style.width  = 'var(--button-width)'; // CSS 변수 참조
			}
		});

	} else if (state === AUTH_FORM_STATE.WITHOUT_JUMIN) {
		// --- KT / LGU+: 버튼을 휴대폰 번호 입력 행 높이에 맞춤 ---
		authForm.classList.add(state);
		btnConfirmWrap.classList.add(state);

		requestAnimationFrame(function() {
			const phoneFieldGroup = document.getElementById('phoneFieldGroup');
			const phoneInputBox = phoneFieldGroup ? phoneFieldGroup.querySelector('.input-box') : null;
			if (phoneInputBox && authForm) {
				let el = phoneInputBox, topVal = 0;
				while (el && el !== authForm) {
					topVal += el.offsetTop;
					el = el.offsetParent;
				}
				btnConfirmWrap.style.top    = topVal + 'px';
				btnConfirmWrap.style.height = phoneInputBox.offsetHeight + 'px';
				btnConfirmWrap.style.width  = 'var(--button-width)';
			}
		});
	}
	// DEFAULT 상태는 클래스와 스타일을 추가하지 않음 (아무것도 안 함)
}


/* ============================================================
 * [9] 통신사 선택 관련 로직
 * ============================================================
 * 사용자가 통신사(SKT / KT / LGU+)를 선택할 때마다 실행됩니다.
 * 선택된 통신사에 따라:
 *   - 주민등록번호 입력란 표시/숨김
 *   - 약관 텍스트 변경
 *   - 폼 상태(버튼 위치) 변경
 *   - 서비스 배너 표시/숨김
 * ============================================================ */

// 통신사 선택 라디오 버튼 전체를 NodeList로 가져옴
const telecomRadios = document.querySelectorAll('input[name="telCdRadio"]');

// 주민등록번호 입력 필드 그룹 요소
// HTML에서 주석 처리된 경우 getElementById는 null을 반환 → 안전하게 처리됨
const juminFieldGroup = document.getElementById('juminFieldGroup');

/**
 * 통신사가 변경될 때 호출되는 함수
 * 선택된 통신사에 따라 폼 UI를 업데이트합니다.
 */
function handleCarrierChange() {
	// 현재 선택된 통신사 라디오 버튼을 가져옴
	const selectedTelecom = document.querySelector('input[name="telCdRadio"]:checked');

	// 아무것도 선택되지 않았으면 함수 종료 (초기 로드 시 발생 가능)
	if (!selectedTelecom) return;

	const carrierValue = selectedTelecom.value; // 'SKT', 'KT', 'LGT' 중 하나

	// 약관 텍스트 요소들 (통신사별로 다른 약관명 표시)
	const stplat4Text  = document.getElementById('stplat4Text');  // 4번 약관 제목 텍스트
	const stplatSkt    = document.getElementById('stplatSkt');    // SKT 전용 약관 행
	const stplatSktAdd1 = document.getElementById('stplatSktAdd1'); // SKT 추가 약관 1
	const stplatSktAdd2 = document.getElementById('stplatSktAdd2'); // SKT 추가 약관 2
	const serviceTypeText = document.getElementById('serviceTypeText'); // 서비스 유형 텍스트

	// AUTH_FORM_DEFAULT_STATE가 false일 때만 상태 전환 수행
	// (true이면 항상 DEFAULT 상태 유지이므로 전환 불필요)
	if (!AUTH_FORM_DEFAULT_STATE) {
		// SKT이고 juminFieldGroup이 실제로 DOM에 존재할 때만 WITH_JUMIN 적용
		// juminFieldGroup이 null이면(주석 처리된 페이지) 항상 WITHOUT_JUMIN 적용
		if (carrierValue === 'SKT' && juminFieldGroup) {
			setAuthFormState(AUTH_FORM_STATE.WITH_JUMIN);
		} else {
			setAuthFormState(AUTH_FORM_STATE.WITHOUT_JUMIN);
		}
	}

	const serviceBnr = document.getElementById('serviceBnr'); // 서비스 배너 요소

	if (carrierValue === 'SKT') {
		// SKT 선택 시
		if (juminFieldGroup) juminFieldGroup.style.display = 'block'; // 주민번호 필드 표시
		if (stplat4Text)  stplat4Text.innerText  = 'SKT개인정보 제3자 제공동의';
		if (stplatSkt)    stplatSkt.style.display    = ''; // display를 ''로 설정하면 CSS의 기본값으로 복귀
		if (stplatSktAdd1) stplatSktAdd1.style.display = '';
		if (stplatSktAdd2) stplatSktAdd2.style.display = '';
		if (serviceTypeText) serviceTypeText.innerText = '통신사 제휴 유료 부가서비스';
		if (serviceBnr) serviceBnr.style.display = '';

	} else {
		// KT 또는 LGU+ 선택 시 (SKT가 아닌 경우 공통 처리)
		if (juminFieldGroup) juminFieldGroup.style.display = 'none'; // 주민번호 필드 숨김
		if (stplatSkt)    stplatSkt.style.display    = 'none';
		if (stplatSktAdd1) stplatSktAdd1.style.display = 'none';
		if (stplatSktAdd2) stplatSktAdd2.style.display = 'none';

		if (carrierValue === 'KT') {
			if (stplat4Text)  stplat4Text.innerText = 'KT개인정보 제3자 제공동의';
			if (serviceTypeText) serviceTypeText.innerText = '이통사 제휴 유료 부가서비스';
			if (serviceBnr) serviceBnr.style.display = 'none';

		} else if (carrierValue === 'LGT') {
			if (stplat4Text)  stplat4Text.innerText = 'LGU+ 및 LGU+ MVNO 개인정보 제3자 제공동의';
			if (serviceTypeText) serviceTypeText.innerText = '이통사 유료 부가서비스';
			if (serviceBnr) serviceBnr.style.display = '';
		}
	}

	// 통신사 변경 후 확인 버튼 상태도 다시 계산
	// typeof 체크: 함수가 선언되어 있을 때만 호출 (선언 순서 문제 방지)
	if (typeof updatePhoneConfirmBtnState === 'function') {
		updatePhoneConfirmBtnState();
	}
}

// 각 통신사 라디오 버튼에 change 이벤트 리스너 등록
// forEach: NodeList의 각 요소에 반복 실행
telecomRadios.forEach(radio => radio.addEventListener('change', handleCarrierChange));

// AUTH_FORM_DEFAULT_STATE가 false이면 페이지 로드 시 기본 상태를 WITHOUT_JUMIN으로 설정
// (통신사 선택 전 버튼 위치를 전화번호 기준으로 미리 잡아둠)
if (!AUTH_FORM_DEFAULT_STATE) {
	setAuthFormState(AUTH_FORM_STATE.WITHOUT_JUMIN);
}

// 초기 실행: 페이지 로드 시 현재 선택된 통신사 상태를 반영
// (새로고침 시 브라우저가 이전 선택값을 기억할 수 있어서 초기에도 호출 필요)
handleCarrierChange();


/* ============================================================
 * [10] 임시 테스트 기능 (개발용)
 * ============================================================
 * #testToggle 요소를 클릭하면 폼의 순서를 바꾸는 테스트 기능입니다.
 * 실제 배포 시에는 HTML에서 #testToggle 요소를 제거하면 됩니다.
 * ============================================================ */
const testToggle = document.getElementById('testToggle');
const signUpForm = document.querySelector(".subscription-form");

if (testToggle && signUpForm) {
	testToggle.addEventListener('click', function() {
		// classList.toggle: 클래스가 있으면 제거, 없으면 추가
		signUpForm.classList.toggle('reorder');
		console.log('[Test] Order toggled. reorder class:', signUpForm.classList.contains('reorder'));
	});
	testToggle.style.cursor = 'pointer'; // 마우스 커서를 손 모양으로 변경
}


/* ============================================================
 * [11] 약관 동의 관련 로직
 * ============================================================
 * 약관 동의 UI는 세 가지 기능을 가집니다:
 *   1. 전체 동의 체크박스: 모든 하위 항목을 한 번에 체크/해제
 *   2. 개별 체크박스: 개별 항목 체크 시 전체 동의 상태 자동 갱신
 *   3. 펼침/접힘 토글: 약관 목록을 접거나 펼치는 애니메이션
 * ============================================================ */

// 전체 동의 체크박스
const agreeAll = document.querySelector(".agreeAll");

// 약관 패널 내 모든 개별 체크박스
const agrees = document.querySelectorAll(".terms-panel .terms-items input[type='checkbox']");

// 약관 목록 컨테이너 (펼침/접힘 대상)
const agreeContainer = document.querySelector(".terms-panel .terms-list");

// 약관 목록 펼침/접힘 토글 버튼
const btnToggleAgree = document.querySelector(".btn-terms-toggle");

// 반드시 동의해야 하는 필수 약관 체크박스 목록
// null이 섞일 수 있으나 나중에 every() 내부에서 null 체크함
const requiredAgrees = [
	document.getElementById("chk1"),
	document.getElementById("chk2"),
	document.getElementById("chk3"),
	document.getElementById("chk4")
];

/**
 * 약관 목록의 펼침/접힘 상태를 제어하는 함수
 * @param {boolean} collapse - true면 접기, false면 펼치기
 *
 * CSS transition과 연동되어 높이가 부드럽게 변합니다.
 * 1. 접을 때: 현재 scrollHeight를 명시적으로 설정한 후 collapsed 클래스 추가
 *    → CSS: .collapsed { height: 0 } 로 인해 transition 발생
 * 2. 펼칠 때: collapsed 클래스를 제거하고 scrollHeight로 목표 높이 설정
 *    → transitionend 이벤트에서 height: 'auto'로 전환 (내용이 바뀌어도 유연하게 대응)
 */
function setAgreeContainerCollapse(collapse) {
	const isCurrentlyCollapsed = agreeContainer.classList.contains("collapsed");

	if (collapse && !isCurrentlyCollapsed) {
		// 현재 펼쳐진 상태 → 접기
		agreeContainer.style.height = `${agreeContainer.scrollHeight}px`; // 현재 높이를 명시적으로 설정
		void agreeContainer.offsetWidth; // 리플로우 강제 실행 (이 줄이 없으면 transition이 동작 안 할 수 있음)
		agreeContainer.classList.add("collapsed");
		btnToggleAgree.classList.add("collapsed");

	} else if (!collapse && isCurrentlyCollapsed) {
		// 현재 접힌 상태 → 펼치기
		agreeContainer.classList.remove("collapsed");
		agreeContainer.style.height = `${agreeContainer.scrollHeight}px`; // 펼쳐질 목표 높이 설정
		btnToggleAgree.classList.remove("collapsed");
	}
}

// 토글 버튼 클릭 시 현재 상태의 반대로 전환
btnToggleAgree?.addEventListener('click', function() {
	// !agreeContainer.classList.contains("collapsed"):
	// 현재 collapsed면 true → collapse=true(접기), 아니면 false(펼치기)
	setAgreeContainerCollapse(!agreeContainer.classList.contains("collapsed"));
});

// transition 애니메이션이 끝난 후 height를 'auto'로 변경
// 이유: height를 고정값(px)으로 두면 내용이 바뀔 때 레이아웃이 틀어질 수 있음
agreeContainer?.addEventListener('transitionend', function(e) {
	// height 속성의 transition이 끝났고, 현재 펼쳐진 상태일 때만 처리
	if (e.propertyName === 'height' && !this.classList.contains('collapsed')) {
		this.style.height = 'auto';
	}
});

/**
 * 개별 체크박스 변경 시 전체 동의 상태를 업데이트하는 함수
 * 모든 개별 항목이 체크되어 있으면 전체 동의도 체크, 하나라도 해제되면 전체 동의 해제
 */
function updateSubmitBtn() {
	if (!agreeAll) return;

	// Array.from: NodeList를 배열로 변환 (.every()를 쓰기 위해)
	// .every(): 모든 요소가 조건을 만족하면 true
	const allChecked = Array.from(agrees).every(chk => chk.checked);

	// 불필요한 DOM 업데이트 방지 (이미 같은 상태면 변경하지 않음)
	if (agreeAll.checked !== allChecked) {
		agreeAll.checked = allChecked;
	}
}

// 전체 동의 체크박스 클릭 시 모든 하위 항목에 같은 상태 적용
agreeAll?.addEventListener("change", function() {
	// this.checked: 전체 동의 체크박스가 체크됐으면 true
	agrees.forEach(chk => chk.checked = this.checked);
});

// 개별 체크박스 각각에 change 이벤트 등록
agrees.forEach(chk => chk.addEventListener("change", updateSubmitBtn));


/* ============================================================
 * [12] 확인 버튼 클릭 → 인증번호 발송 요청 로직
 * ============================================================
 * '확인' 버튼(.btn-send-otp) 클릭 시 아래 순서로 유효성을 검사합니다:
 *
 *   1단계: 통신사 선택 여부 확인 (미선택이면 토스트)
 *   2단계: 버튼 active 상태 확인 (자리수 미충족이면 토스트)
 *   3단계: 재요청 모드 확인 (이미 발송했으면 재발송 처리)
 *   4단계: 필수 약관 동의 여부 확인 (미동의 시 팝업)
 *   5단계: KT 선택 시 MVNO 추가 약관 동의 팝업
 *   6단계: 모든 조건 통과 → processPhoneAuth() 실행
 * ============================================================ */
btnPhoneConfirm?.addEventListener('click', function() {

	// [1단계] 통신사 선택 여부 확인
	const selectedTelecom = document.querySelector('input[name="telCdRadio"]:checked');
	if (!selectedTelecom) {
		showToast("통신사를 선택해 주세요.");
		return; // return으로 함수 종료 (이후 코드 실행 안 함)
	}

	// [2단계] 버튼이 active 상태가 아니면 어떤 필드가 부족한지 안내
	if (!this.classList.contains('active')) {
		const isSktSelected = selectedTelecom.value === 'SKT';
		if (phoneInput.value.length === 0) {
			showToast("휴대폰 번호를 입력해 주세요.");
		} else if (phoneInput.value.length < 11) {
			showToast("휴대폰 번호를 확인해주세요.");
		} else if (isSktSelected && juminInput && juminInput.value.length < 8) {
			showToast("주민등록번호를 확인해주세요.");
		}
		return;
	}

	// [3단계] 이미 인증번호를 발송한 상태(재요청 모드)
	if (isAuthRequested) {
		if (timeLeft > 0) {
			// 타이머가 아직 진행 중 → 만료 후에 재발송 가능
			showToast("입력시간 만료 후 인증번호 발송이 가능합니다.");
		} else {
			// 타이머 만료 → 재발송 처리 (로딩 1초 후 타이머 재시작)
			showLoading(() => {
				startTimer();
				showToast("인증번호가 발송되었습니다.");
			});
		}
		return;
	}

	// [4단계] 필수 약관 동의 여부 확인
	// SKT 선택 시 추가 약관 항목도 필수 목록에 포함
	let currentRequiredAgrees = [...requiredAgrees]; // 기존 배열을 복사 (원본 수정 방지)

	const chkSkt    = document.getElementById("chkSkt");
	const stplatSkt = document.getElementById('stplatSkt');
	// SKT 약관 행이 실제로 화면에 보일 때만 필수 목록에 추가
	if (chkSkt && stplatSkt && stplatSkt.style.display !== 'none') {
		currentRequiredAgrees.push(chkSkt);
	}

	const chkSktAdd1    = document.getElementById("chkSktAdd1");
	const stplatSktAdd1 = document.getElementById('stplatSktAdd1');
	if (chkSktAdd1 && stplatSktAdd1 && stplatSktAdd1.style.display !== 'none') {
		currentRequiredAgrees.push(chkSktAdd1);
	}

	const chkSktAdd2    = document.getElementById("chkSktAdd2");
	const stplatSktAdd2 = document.getElementById('stplatSktAdd2');
	if (chkSktAdd2 && stplatSktAdd2 && stplatSktAdd2.style.display !== 'none') {
		currentRequiredAgrees.push(chkSktAdd2);
	}

	// every(): 모든 체크박스가 체크되어 있는지 확인
	const requiredChecked = currentRequiredAgrees.every(chk => chk && chk.checked);
	if (!requiredChecked) {
		// 약관 미동의 시 sidePopup 팝업 노출 + 딤 표시
		document.getElementById('sidePopup').classList.add('active');
		dimOverlay.style.display = 'block';
		return;
	}

	// [5단계] KT 선택 시 MVNO 추가 약관 동의 팝업 노출
	// (알뜰폰 이용자는 개인정보 제3자 제공 동의 필요)
	if (selectedTelecom.value === 'KT') {
		const ktMvnoLayer = document.getElementById('kt-mvno-layer');
		if (ktMvnoLayer) {
			ktMvnoLayer.classList.add('active');
			dimOverlay.style.display = 'block';
			return; // 팝업에서 동의 후 processPhoneAuth() 호출
		}
	}

	// [6단계] 모든 조건 통과 → 실제 인증번호 발송 프로세스 실행
	processPhoneAuth();
});


/**
 * 인증번호 발송 프로세스 함수
 * btnPhoneConfirm 클릭 핸들러에서 분리한 이유:
 *   KT MVNO 팝업의 '동의 후 인증번호 요청' 버튼에서도 이 함수를 재사용하기 때문
 */
function processPhoneAuth() {
	// SKT이고 juminInput이 있을 때 주민번호 재확인
	const checkedCarrier  = document.querySelector('input[name="telCdRadio"]:checked');
	const isSktSelected   = checkedCarrier ? checkedCarrier.value === 'SKT' : false;
	if (isSktSelected && juminInput && juminInput.value.length < 8) {
		showToast("주민등록번호를 확인해주세요.");
		return;
	}

	// 휴대폰 번호 자리수 재확인
	if (phoneInput.value.length < 11) {
		showToast("휴대폰 번호를 확인해주세요.");
		return;
	}

	// 010으로 시작하는 번호인지 확인
	if (!phoneInput.value.startsWith('010')) {
		showToast('010으로 시작하는 번호만 입력이 가능합니다.');
		return;
	}

	// reCAPTCHA 실행 → 검증 성공 시 executePhoneAuthLogic 콜백 호출
	// 현재는 테스트 환경이므로 reCAPTCHA를 건너뛰고 바로 실행
	/* 실제 서비스 적용 시 아래 주석 해제:
	try {
		grecaptcha.execute();
	} catch(e) {
		console.error("reCAPTCHA 실행 오류:", e);
		executePhoneAuthLogic("mock-token"); // 로컬/테스트 환경 대응
	}
	*/
	executePhoneAuthLogic("mock-token"); // 테스트용: reCAPTCHA 없이 바로 실행
}


/**
 * reCAPTCHA 검증 완료 후 실행되는 실제 인증 로직
 * window에 등록하는 이유: reCAPTCHA가 callback으로 글로벌 함수를 요구하기 때문
 * @param {string} token - reCAPTCHA가 발급한 검증 토큰
 */
window.executePhoneAuthLogic = function(token) {
	// 빈 토큰은 reCAPTCHA 검증 실패를 의미
	if (token === "") {
		showToast("자동 입력 방지 검증에 실패했습니다. 다시 시도해주세요.");
		return;
	}

	// 로딩 1초 표시 후 실제 인증 처리
	showLoading(() => {
		// reCAPTCHA를 초기 상태로 리셋 (다음 요청을 위해)
		try { grecaptcha.reset(); } catch(e) {} // reCAPTCHA가 없는 환경에서는 무시

		// TODO: 실제 서버 응답에 따라 아래 코드로 실패 처리
		// if (serverResponse.result !== 'success') {
		//     const authFailPopup = document.getElementById('authFailPopup');
		//     if (authFailPopup) {
		//         authFailPopup.classList.add('active');
		//         dimOverlay.style.display = 'block';
		//     }
		//     return;
		// }

		// ---- 인증번호 발송 성공 처리 ----

		// 상태 플래그를 true로 설정 (이제 재요청 모드로 전환됨)
		isAuthRequested = true;

		// 확인 버튼에 발송 완료 상태 클래스 추가 (CSS에서 버튼 스타일 변경)
		btnPhoneConfirm.classList.add('is-sent');

		// 휴대폰 번호 입력 필드를 읽기 전용으로 변경 (발송 후 번호 수정 불가)
		phoneInput.readOnly = true;
		phoneInput.style.opacity = '0.5'; // 회색으로 보이게 (비활성화된 느낌)

		// 주민번호 필드도 있으면 동일하게 비활성화
		if (juminInput) {
			juminInput.readOnly = true;
			juminInput.style.opacity = '0.5';
		}

		// 통신사 선택 라디오 버튼 비활성화 (발송 후 통신사 변경 불가)
		telecomRadios.forEach(radio => radio.disabled = true);
		document.querySelector(".carrier-select").classList.add('disabled');

		// 약관 체크박스 비활성화
		agreeAll.disabled = true;
		agrees.forEach(chk => chk.disabled = true);
		document.querySelector('.terms-panel').classList.add('disabled');

		// 인증번호 입력 영역 펼치기 (CSS transition으로 부드럽게 표시)
		auth_wrap.classList.add("active");

		// 툴팁을 잠깐 숨기고 scrollHeight를 계산한 후 다시 복원
		// (툴팁이 보이는 상태에서 높이를 계산하면 툴팁 높이가 포함될 수 있어서)
		const tempDisplay = helpTooltip.style.display;
		helpTooltip.style.display = "none";
		auth_wrap.style.height = `${auth_wrap.scrollHeight}px`;
		helpTooltip.style.display = tempDisplay;

		// 인증번호 입력 타이머 시작 (3분)
		startTimer();

		// 인증번호 발송 완료 팝업 표시
		const authSuccessPopup = document.getElementById('authSuccessPopup');
		if (authSuccessPopup) {
			authSuccessPopup.classList.add('active');
			dimOverlay.style.display = 'block';
		}
	});
};


/* ============================================================
 * [13] 팝업 이벤트 핸들링
 * ============================================================
 * 각 팝업의 확인/취소/닫기 버튼에 이벤트 리스너를 등록합니다.
 * 팝업 닫기: classList.remove('active') + dimOverlay 숨김
 * ============================================================ */

// ---- 약관 동의 유도 팝업 (#sidePopup) ----
// 사용자가 필수 약관 미동의 상태에서 확인 버튼을 클릭했을 때 표시되는 팝업
const sidePopup   = document.getElementById('sidePopup');
const btnSideCancel  = document.getElementById('btnSideCancel');
const btnSideConfirm = document.getElementById('btnSideConfirm');

// 취소: 팝업만 닫고 약관 동의는 그대로
btnSideCancel?.addEventListener('click', function() {
	sidePopup.classList.remove('active');
	dimOverlay.style.display = 'none';
});

// 확인: 모든 약관을 강제로 체크한 후 인증번호 발송 진행
btnSideConfirm?.addEventListener('click', function() {
	// 1. 모든 약관 자동 체크
	agreeAll.checked = true;
	agrees.forEach(chk => chk.checked = true);

	// 2. 팝업 및 딤 닫기
	sidePopup.classList.remove('active');
	dimOverlay.style.display = 'none';

	// 3. 인증번호 발송 진행
	processPhoneAuth();
});

// ---- KT MVNO 추가 약관 동의 팝업 (#kt-mvno-layer) ----
// KT 선택 시 알뜰폰 이용자의 개인정보 제3자 제공 동의를 받는 팝업
const ktMvnoLayer   = document.getElementById('kt-mvno-layer');
const btnKtMvnoClose  = document.getElementById('btnKtMvnoClose');
const btnKtMvnoSubmit = document.getElementById('btnKtMvnoSubmit');

// 닫기(X): 팝업만 닫고 인증번호 발송 안 함
btnKtMvnoClose?.addEventListener('click', function() {
	ktMvnoLayer.classList.remove('active');
	dimOverlay.style.display = 'none';
});

// 동의 후 인증번호 요청: 팝업 닫고 인증번호 발송 진행
btnKtMvnoSubmit?.addEventListener('click', function() {
	ktMvnoLayer.classList.remove('active');
	dimOverlay.style.display = 'none';
	processPhoneAuth();
});

// ---- 인증번호 발송 실패 팝업 (#authFailPopup) ----
// 서버에서 인증번호 발송 실패 응답이 왔을 때 표시
const btnAuthFailConfirm = document.getElementById('btnAuthFailConfirm');
if (btnAuthFailConfirm) {
	btnAuthFailConfirm.addEventListener('click', function() {
		document.getElementById('authFailPopup').classList.remove('active');
		dimOverlay.style.display = 'none';
	});
}

// ---- 인증번호 발송 완료 팝업 (#authSuccessPopup) ----
// 인증번호 발송 성공 후 자동으로 표시됨
const btnAuthSuccessConfirm = document.getElementById('btnAuthSuccessConfirm');
if (btnAuthSuccessConfirm) {
	btnAuthSuccessConfirm.addEventListener('click', function() {
		document.getElementById('authSuccessPopup').classList.remove('active');
		dimOverlay.style.display = 'none';
	});
}


/* ============================================================
 * [14] 최종 가입 버튼 클릭 → 가입 완료 처리
 * ============================================================
 * 하단의 '전화번호 안심로그인 유료가입' 버튼을 클릭하면 실행됩니다.
 * 순서:
 *   1. 인증번호 요청(확인 버튼) 여부 확인
 *   2. 필수 약관 동의 재확인
 *   3. 인증번호 6자리 입력 여부 확인
 *   4. KT면 유료 가입 안내 팝업, 그 외엔 바로 가입 완료
 * ============================================================ */
primaryBtn?.addEventListener("click", function() {

	// [1단계] 인증번호 요청을 하지 않은 상태에서 가입 버튼 클릭
	if (!isAuthRequested) {
		const selectedTelecom = document.querySelector('input[name="telCdRadio"]:checked');
		const isSktSelected   = selectedTelecom && selectedTelecom.value === 'SKT';
		const isPhoneFilled   = phoneInput.value.length > 0;
		// 삼항 연산자: SKT면 주민번호도 확인, 아니면 항상 true
		const isJuminFilled   = isSktSelected ? (juminInput && juminInput.value.length > 0) : true;

		if (isPhoneFilled && isJuminFilled) {
			// 번호는 입력했는데 확인 버튼을 안 누른 경우
			showToast("확인 버튼을 눌러 진행해주세요.");
		} else {
			// 번호 자체를 아직 입력 안 한 경우
			showToast("필수 정보를 모두 입력해주세요.");
		}
		return;
	}

	// [2단계] 필수 약관 재확인
	const requiredChecked = requiredAgrees.every(chk => chk && chk.checked);
	if (!requiredChecked) {
		showToast("필수 약관에 동의해 주세요.");
		return;
	}

	// [3단계] 인증번호 6자리 입력 여부 확인
	if (authInput.value.length < 6) {
		showToast("인증번호 6자리를 입력해 주세요.");
		return;
	}

	/**
	 * 가입 완료 처리 함수 (primaryBtn 클릭 핸들러 내부에 정의)
	 * 내부 함수로 정의한 이유: KT 팝업 확인 후에도 같은 로직을 재사용하기 위해
	 */
	function completeJoin() {
		// 타이머 중지
		clearInterval(timerInterval);

		// <html> 태그에 'complete' 클래스 추가 (가입 완료 상태 CSS 전환용)
		document.documentElement.classList.add('complete');

		// 입력 섹션 숨기고 완료 섹션 표시
		const sectionInput    = document.getElementById('sectionInput');
		const sectionComplete = document.getElementById('sectionComplete');
		if (sectionInput)    sectionInput.style.display    = 'none';
		if (sectionComplete) sectionComplete.style.display = 'flex';

		// 가입 완료 안내 팝업(#sidePopup2) 표시
		const sidePopup2 = document.getElementById('sidePopup2');
		if (sidePopup2) {
			sidePopup2.classList.add('active');
			dimOverlay.style.display = 'block';

			// 팝업 내 확인 버튼 클릭 시 결과 화면 표시
			document.getElementById('btnSideConfirm2').onclick = function() {
				sidePopup2.classList.remove('active');
				dimOverlay.style.display = 'none';
				document.getElementById('popupCont05').style.display = 'block';
			};
		} else {
			// sidePopup2가 없으면 바로 결과 화면 표시
			document.getElementById('popupCont05').style.display = 'block';
		}
	}

	// [4단계] 로딩 1초 후 통신사에 따라 분기
	showLoading(() => {
		const selectedTelecom = document.querySelector('input[name="telCdRadio"]:checked')?.value;

		if (selectedTelecom === 'KT') {
			// KT: 유료 가입 안내 팝업 먼저 표시
			const ktPopup = document.querySelector('.layer.signUp_kt');
			ktPopup.style.display = 'block';
			dimOverlay.style.display = 'block';

			// 팝업 내 '유료가입' 버튼 클릭
			ktPopup.querySelector('.next').onclick = function() {
				ktPopup.style.display = 'none';
				dimOverlay.style.display = 'none';
				StatisticsManager.track('signup'); // KT 가입 통계 기록
				completeJoin();
			};

			// 팝업 내 취소/닫기 버튼 클릭 (가입 취소)
			const closeKtPopup = function() {
				ktPopup.style.display = 'none';
				dimOverlay.style.display = 'none';
			};
			ktPopup.querySelector('.btn_cancel').onclick = closeKtPopup;
			ktPopup.querySelector('.btn_close').onclick  = closeKtPopup;

		} else {
			// SKT, LGU+: 바로 가입 완료 처리
			StatisticsManager.track('signup'); // 가입 통계 기록
			completeJoin();
		}
	});
});


/* ============================================================
 * [15] 인증번호 타이머 로직
 * ============================================================
 * 인증번호 발송 후 사용자가 입력할 수 있는 시간을 3분으로 제한합니다.
 * setInterval: 지정한 간격(ms)마다 함수를 반복 실행
 * clearInterval: setInterval을 멈춤 (ID값을 전달)
 * ============================================================ */

/**
 * 타이머를 (재)시작하는 함수
 * 이미 진행 중인 타이머가 있으면 먼저 멈추고 새로 시작합니다.
 */
function startTimer() {
	clearInterval(timerInterval); // 이전 타이머가 있으면 중지
	timeLeft = 180;               // 3분(180초)으로 초기화
	updateTimerDisplay();         // 화면에 "03:00" 즉시 표시

	// 1초마다 timeLeft를 1씩 줄이고 화면 갱신
	timerInterval = setInterval(() => {
		timeLeft--;
		updateTimerDisplay();

		if (timeLeft <= 0) {
			clearInterval(timerInterval); // 0이 되면 타이머 중지
		}
	}, 1000); // 1000ms = 1초
}

/**
 * 타이머 디스플레이를 MM:SS 형식으로 갱신하는 함수
 * 예) timeLeft = 145 → "02:25"
 */
function updateTimerDisplay() {
	const m = Math.floor(timeLeft / 60); // 분 (소수점 버림)
	const s = timeLeft % 60;             // 나머지 초

	// 항상 두 자리로 표시 (예: 5 → "05")
	timerDisplay.textContent = `0${m}:${s < 10 ? '0' : ''}${s}`;

	// 시간이 만료되면 입력 필드를 다시 활성화 (재요청 가능 상태)
	if (timeLeft <= 0) {
		phoneInput.readOnly = false;
		phoneInput.style.opacity = '1';
		if (juminInput) {
			juminInput.readOnly = false;
			juminInput.style.opacity = '1';
		}
	}
}


/* ============================================================
 * [16] UI 유틸리티 (토스트, 도움말 툴팁, 팝업 닫기 버튼)
 * ============================================================ */

// 토스트 자동 숨김에 사용하는 타임아웃 ID
let toastTimeout;

/**
 * 상단에 잠깐 표시되는 알림 메시지(토스트)를 보여주는 함수
 * 2.5초 후 자동으로 사라집니다.
 * @param {string} message - 표시할 메시지 내용
 */
function showToast(message) {
	const toast    = document.getElementById('toastPopup');
	const toastDim = document.getElementById('toastDim');

	if (message) toast.textContent = message; // 메시지 내용 설정

	// 토스트 표시 (CSS에서 .show 클래스가 있으면 보임)
	toast.classList.add('show');

	// 토스트 하단 dim(그라데이션) 표시
	if (toastDim) {
		toastDim.classList.add('show');
		// setTimeout(fn, 0): 현재 실행 컨텍스트가 끝난 직후 비동기로 실행
		// 렌더링이 완료된 후 정확한 높이를 계산하기 위해 사용
		setTimeout(() => {
			// (현재는 높이를 동적으로 계산하는 코드가 주석처리 되어 있음)
		}, 0);
	}

	// 진동 피드백 (모바일 기기에서 지원하는 경우)
	if ("vibrate" in navigator) {
		navigator.vibrate(50); // 50ms 진동
	}

	// 기존 타임아웃이 있으면 초기화 (연속 호출 시 타이머 리셋)
	clearTimeout(toastTimeout);

	// 2.5초 후 토스트 숨김
	toastTimeout = setTimeout(() => {
		toast.classList.remove('show');
		if (toastDim) toastDim.classList.remove('show');
	}, 2500);
}

// 도움말(?) 아이콘 클릭 시 툴팁 토글 (표시 ↔ 숨김)
btnHelp?.addEventListener('click', function(e) {
	// e.stopPropagation(): 클릭 이벤트가 document까지 전파되지 않도록 차단
	// (document의 click 이벤트에서 툴팁을 닫는 코드가 있어서 상충을 방지)
	e.stopPropagation();
	helpTooltip.classList.toggle('active');
});

// 화면 어느 곳이든 클릭하면 열려있는 도움말 툴팁 닫기
document.addEventListener('click', function(e) {
	// 클릭된 요소가 툴팁 내부도 아니고, 도움말 버튼도 아닐 때만 닫기
	if (!helpTooltip.contains(e.target) && e.target !== btnHelp) {
		helpTooltip.classList.remove('active');
	}
});

// 가입 완료 섹션 내 '닫기' 버튼들 공통 이벤트 처리
// .btn-page-exit 클래스를 가진 모든 버튼에 일괄 등록
const exitCompleteBtns = document.querySelectorAll('.btn-page-exit');
exitCompleteBtns.forEach(btn => {
	btn.addEventListener('click', function() {
		// closest(): 자신을 포함한 조상 요소 중 조건에 맞는 가장 가까운 요소를 찾음
		this.closest('.signUp_section').style.display = 'none';
	});
});

// 헤더의 '취소(X)' 버튼 클릭 시 종료 확인 팝업 표시
const exitBtn = document.getElementById('exitBtn');
if (exitBtn) {
	exitBtn.addEventListener('click', function() {
		const exitPopup = document.getElementById('exitPopup');
		if (exitPopup) {
			exitPopup.classList.add('active');
			dimOverlay.style.display = 'block';

			// 종료 확인 팝업의 '확인' 버튼 (가입 종료)
			document.getElementById('btnExitConfirm').onclick = function() {
				exitPopup.classList.remove('active');
				dimOverlay.style.display = 'none';
				// 실제 서비스에서는 여기에 이전 페이지 이동 또는 웹뷰 닫기 코드 추가
			};

			// 종료 확인 팝업의 '취소' 버튼 (가입 계속 진행)
			document.getElementById('btnExitCancel').onclick = function() {
				exitPopup.classList.remove('active');
				dimOverlay.style.display = 'none';
			};
		}
	});
}


/* ============================================================
 * [17] 약관 상세 팝업 열기 (글로벌 함수)
 * ============================================================
 * HTML에서 직접 onclick="privacyPopOpen('code')"으로 호출됩니다.
 * window에 등록해야 HTML에서 전역 함수로 접근할 수 있습니다.
 * @param {string} code - 약관 코드 (현재는 미사용, 추후 여러 약관 분기에 활용 가능)
 * ============================================================ */
window.privacyPopOpen = function(code) {
	const privacyPopup = document.getElementById('privacy01');
	if (privacyPopup) {
		privacyPopup.style.display = 'block';
		dimOverlay.style.display = 'block';
	}
};

// 약관 팝업 닫기 버튼 이벤트
const privacyCloseBtn  = document.querySelector('#privacy01 .terms-layer__close');
const privacyConfirmBtn = document.querySelector('#privacy01 .terms-layer__btn-confirm');

/**
 * 약관 팝업을 닫는 함수
 * 딤 처리 시 주의: 다른 팝업(sidePopup 등)이 열려있으면 딤을 유지해야 함
 */
function closePrivacyPopup() {
	document.getElementById('privacy01').style.display = 'none';

	// sidePopup이 활성화 상태가 아닐 때만 딤 닫기
	if (!sidePopup.classList.contains('active')) {
		dimOverlay.style.display = 'none';
	}
}

if (privacyCloseBtn)   privacyCloseBtn.addEventListener('click', closePrivacyPopup);
if (privacyConfirmBtn) privacyConfirmBtn.addEventListener('click', closePrivacyPopup);


/* ============================================================
 * [18] 7일간 보이지 않기 기능
 * ============================================================
 * 사용자가 '7일간 보이지 않기'를 선택하면 localStorage에 만료 시간을 저장합니다.
 * 다음 방문 시 만료 시간이 남아있으면 페이지를 숨깁니다.
 *
 * new Date().getTime(): 1970년 1월 1일부터 현재까지의 밀리초 (Unix timestamp)
 * 7일 = 7 * 24(시간) * 60(분) * 60(초) * 1000(밀리초)
 * ============================================================ */
const chkHide7 = document.getElementById('chkHide7');
const STORAGE_KEY_HIDE = 'safeconnect_hide_until'; // localStorage 키

/**
 * 페이지 로드 시 숨김 여부를 확인하는 함수
 * localStorage에 저장된 만료 시간이 아직 유효하면 페이지를 숨깁니다.
 */
function checkInitialVisibility() {
	const hideUntil = localStorage.getItem(STORAGE_KEY_HIDE); // 저장된 만료 timestamp

	if (hideUntil) {
		const now = new Date().getTime(); // 현재 timestamp
		if (now < parseInt(hideUntil)) {
			// 만료 시간이 아직 남아있으면 → 페이지 숨기기
			document.querySelector('.vas-container').style.display = 'none';
			console.log("7일간 보이지 않기 기능이 활성화되어 있습니다.");
		} else {
			// 만료 시간이 지났으면 → 저장된 데이터 삭제 (다음 방문부터 정상 표시)
			localStorage.removeItem(STORAGE_KEY_HIDE);
		}
	}
}

// '7일간 보이지 않기' 버튼 클릭 이벤트
const btnHide7Action = document.getElementById('btnHide7Action');
if (btnHide7Action && chkHide7) {
	btnHide7Action.addEventListener('click', function() {
		if (chkHide7.checked) {
			// 현재 시간 + 7일 = 만료 시간
			const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
			const expireTime = new Date().getTime() + sevenDaysInMs;

			// 만료 시간을 localStorage에 저장
			localStorage.setItem(STORAGE_KEY_HIDE, expireTime);
			showToast("7일간 이 페이지를 보이지 않도록 설정했습니다.");

			// 1.5초 후 페이지 숨기기 (토스트 메시지를 볼 시간 확보)
			setTimeout(() => {
				document.querySelector('.vas-container').style.display = 'none';
			}, 1500);
		} else {
			showToast("먼저 체크박스를 선택해 주세요.");
		}
	});
}

// 페이지 로드 시 숨김 여부 확인 실행
checkInitialVisibility();


/* ============================================================
 * [19] iOS Safari WebView Input Focus 버그 대응
 * ============================================================
 * 증상: iOS Safari WebView에서 input에 포커스가 해제될 때(focusout),
 *       화면이 스크롤된 상태에서 뷰포트 좌표가 틀어져
 *       버튼을 눌러도 클릭이 안 되는 현상이 발생합니다.
 *
 * 해결: focusout 이벤트 발생 시 현재 스크롤 위치로 강제 스크롤
 *       → 뷰포트 좌표를 올바른 위치로 복원합니다.
 *
 * iOS 체크: navigator.userAgent에 'iPad', 'iPhone', 'iPod'이 포함되어 있는지 확인
 *           !window.MSStream: IE11에서 userAgent에 'iPhone'이 포함되는 버그 제외
 * ============================================================ */
document.addEventListener('focusout', function(e) {
	const target  = e.target; // 포커스가 해제된 요소
	const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName); // 입력 요소인지 확인

	if (isInput) {
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

		if (isIOS) {
			// 50ms 후 현재 스크롤 위치로 다시 스크롤 (뷰포트 좌표 복원)
			// setTimeout을 사용하는 이유: focusout 처리가 끝난 후 실행해야 효과적
			setTimeout(() => {
				window.scrollTo(0, window.scrollY || document.documentElement.scrollTop);
			}, 50);
		}
	}
});
