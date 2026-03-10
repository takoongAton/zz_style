// greCaptcha 로드 콜백 및 전역 함수 설정
	var onloadCallback = function() {
		if (document.getElementById('greCaptcha')) {
			grecaptcha.render(
				'greCaptcha', {
					'sitekey' : "6LfQHq4UAAAAALRMMx1RbrsoU_XdapEc8Ocv5fHM",
					'size' : 'invisible',
					'callback' : executePhoneAuthLogic,
					'badge' : 'bottomright'
				}
			);
		}
	};

	// 1초 서버 통신 시뮬레이션용 로딩 스피너
	function showLoading(callback) {
		const loadingOverlay = document.getElementById('loadingOverlay');
		if (loadingOverlay) loadingOverlay.classList.add('active');
		setTimeout(() => {
			if (loadingOverlay) loadingOverlay.classList.remove('active');
			if (callback) callback();
		}, 1000);
	}

	/**
	 * 통계 관리 모듈 (localStorage 기반)
	 */
	const StatisticsManager = {
		STORAGE_KEY: 'safeconnect_stats',
		
		getToday: function() {
			const d = new Date();
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
		},
		
		getStats: function() {
			const stats = localStorage.getItem(this.STORAGE_KEY);
			return stats ? JSON.parse(stats) : {};
		},
		
		track: function(key) {
			const stats = this.getStats();
			const today = this.getToday();
			
			if (!stats[today]) {
				stats[today] = { visit: 0, signup: 0 };
			}
			
			stats[today][key] = (stats[today][key] || 0) + 1;
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
			console.log(`[Stats] Tracked ${key} for ${today}:`, stats[today]);
		}
	};

	// 페이지 접속 추적
	StatisticsManager.track('visit');

	/**
	 * 요소 선택 및 전역 변수 설정
	 */
	let auth_wrap = document.querySelector("#auth_wrap");
	const phoneInput = document.querySelector('input[type="tel"]:not(#juminNumber)');
	const juminInput = document.querySelector('#juminNumber');
	const authInput = document.querySelector('#auth_wrap input');
	const primaryBtn = document.querySelector('.btn-primary');
	const timerDisplay = document.querySelector('.timer');
	const btnRetry = document.querySelector('.btn-sub-action:not(.btn-phone-confirm)');
	const btnPhoneConfirm = document.querySelector('.btn-phone-confirm');
	const btnHelp = document.querySelector('.btn-help');
	const helpTooltip = document.querySelector('.help-tooltip');

	let isAuthRequested = false; // 인증번호 요청 여부 플래그
	let timerInterval = null;    // 타이머 인터벌 객체
	let timeLeft = 180;          // 타이머 남은 시간 (초 단위, 기본 3분)

	/**
	 * 초기 상태 설정
	 */
	// 인증번호 재요청 버튼 초기 비활성화
	if (btnRetry) btnRetry.classList.add('disabled');

	/**
	 * 입력 필드 이벤트 핸들링 (휴대폰 번호, 주민등록번호, 인증번호)
	 */
	// 휴대폰 번호 입력: 숫자만 허용 및 자리수에 따른 확인 버튼 활성화 제어
	phoneInput.addEventListener('input', function() {
		if (isAuthRequested && timeLeft > 0) return; // 인증 요청 후 재요청 가능 전까지 입력 방지

		this.value = this.value.replace(/[^0-9]/g, '');
		if (this.value.length === 11) {
			btnPhoneConfirm.classList.add('active');
		} else {
			btnPhoneConfirm.classList.remove('active');
		}
	});

	// 주민등록번호 입력: 숫자만 추출 및 자동 하이픈(-) 포맷팅 (6자리-1자리)
	if (juminInput) {
		juminInput.addEventListener('input', function() {
			if (isAuthRequested && timeLeft > 0) return; // 인증 요청 후 재요청 가능 전까지 입력 방지

			let val = this.value.replace(/[^0-9]/g, '');
			if (val.length > 6) {
				val = val.substring(0, 6) + '-' + val.substring(6, 7);
			}
			this.value = val;
		});
	}

	// 인증번호 입력: 숫자만 허용
	authInput.addEventListener('input', function() {
		this.value = this.value.replace(/[^0-9]/g, '');
	});



	/**
	 * 통신사 선택 관련 로직
	 */
	const telecomRadios = document.querySelectorAll('input[name="telCdRadio"]');
	const juminFieldGroup = document.getElementById('juminFieldGroup');
	
	// 통신사 변경에 따른 주민번호 필드 노출 및 약관 텍스트 제어
	function handleCarrierChange() {
		const selectedTelecom = document.querySelector('input[name="telCdRadio"]:checked');
		if (!selectedTelecom) return;

		const carrierValue = selectedTelecom.value;
		const stplat4Text = document.getElementById('stplat4Text');
		const stplatSkt = document.getElementById('stplatSkt');
		const stplatSktAdd1 = document.getElementById('stplatSktAdd1');
		const stplatSktAdd2 = document.getElementById('stplatSktAdd2');
		
		const serviceTypeText = document.getElementById('serviceTypeText');

		// 임시 테스트 : btn-confirm_test 및 부모 요소 클래스 변경
		const btnConfirmTest = document.getElementById('btn-confirm_test');
		const authForm = document.querySelector('.auth-form');
		if (btnConfirmTest) {
			btnConfirmTest.classList.remove('typeA', 'typeB', 'typeC');
			if (authForm) authForm.classList.remove('typeA', 'typeB', 'typeC');

			if (carrierValue === 'SKT') {
				btnConfirmTest.classList.add('typeA');
				if (authForm) authForm.classList.add('typeA');
			} else if (carrierValue === 'KT') {
				btnConfirmTest.classList.add('typeB');
				if (authForm) authForm.classList.add('typeB');
			} else if (carrierValue === 'LGT') {
				btnConfirmTest.classList.add('typeC');
				if (authForm) authForm.classList.add('typeC');
			}
		}
		
		const serviceBnr = document.getElementById('serviceBnr');
		
		if (carrierValue === 'SKT') {
			juminFieldGroup.style.display = 'block';
			if (!isAuthRequested) juminFieldGroup.classList.add('active'); // 인증 전 active 추가
			if (stplat4Text) stplat4Text.innerText = 'SKT개인정보 제3자 제공동의';
			if (stplatSkt) stplatSkt.style.display = '';
			if (stplatSktAdd1) stplatSktAdd1.style.display = '';
			if (stplatSktAdd2) stplatSktAdd2.style.display = '';
			if (serviceTypeText) serviceTypeText.innerText = '통신사 제휴 유료 부가서비스';
			if (serviceBnr) serviceBnr.style.display = '';
		} else {
			juminFieldGroup.style.display = 'none';
			juminFieldGroup.classList.remove('active'); // 타사 선택 시 제거
			if (stplatSkt) stplatSkt.style.display = 'none';
			if (stplatSktAdd1) stplatSktAdd1.style.display = 'none';
			if (stplatSktAdd2) stplatSktAdd2.style.display = 'none';
			if (carrierValue === 'KT') {
				if (stplat4Text) stplat4Text.innerText = 'KT개인정보 제3자 제공동의';
				if (serviceTypeText) serviceTypeText.innerText = '이통사 제휴 유료 부가서비스';
				if (serviceBnr) serviceBnr.style.display = 'none';
			} else if (carrierValue === 'LGT') {
				if (stplat4Text) stplat4Text.innerText = 'LGU+ 및 LGU+ MVNO 개인정보 제3자 제공동의';
				if (serviceTypeText) serviceTypeText.innerText = '이통사 유료 부가서비스';
				if (serviceBnr) serviceBnr.style.display = '';
			}
		}
	}
	
	telecomRadios.forEach(radio => radio.addEventListener('change', handleCarrierChange));
	handleCarrierChange(); // 초기 실행으로 상태 반영

	/**
	 * 임시 테스트 : testToggle 클릭 시 순서 변경 (order: 1)
	 */
	const testToggle = document.getElementById('testToggle');
	const signUpForm = document.querySelector('.signUp_form');
	if (testToggle && signUpForm) {
		testToggle.addEventListener('click', function() {
			signUpForm.classList.toggle('reorder');
			console.log('[Test] Order toggled. reorder class:', signUpForm.classList.contains('reorder'));
		});
		testToggle.style.cursor = 'pointer'; // 클릭 가능함을 시각적으로 표시
	}

	/**
	 * 약관 동의 관련 로직 (전체 동의, 개별 동의, 상세 리스트 토글)
	 */
	const agreeAll = document.querySelector(".agreeAll");
	const agrees = document.querySelectorAll(".terms-agree .agree input[type='checkbox']");
	const agreeContainer = document.querySelector(".terms-agree .list-agree");
	const btnToggleAgree = document.querySelector(".btn-toggle-agree");

	// 필수 약관 ID 배열
	const requiredAgrees = [
		document.getElementById("chk1"),
		document.getElementById("chk2"),
		document.getElementById("chk3"),
		document.getElementById("chk4")
	];

	// 약관 리스트 펼침/접힘 상태 제어 함수
	function setAgreeContainerCollapse(collapse) {
		const isCurrentlyCollapsed = agreeContainer.classList.contains("collapsed");
		if (collapse && !isCurrentlyCollapsed) {
			agreeContainer.style.height = `${agreeContainer.scrollHeight}px`;
			void agreeContainer.offsetWidth; // 리플로우 강제 트리거
			agreeContainer.classList.add("collapsed");
			btnToggleAgree.classList.add("collapsed");
		} else if (!collapse && isCurrentlyCollapsed) {
			agreeContainer.classList.remove("collapsed");
			agreeContainer.style.height = `${agreeContainer.scrollHeight}px`;
			btnToggleAgree.classList.remove("collapsed");
		}
	}

	// 약관 우측 토글 버튼 클릭 이벤트
	btnToggleAgree.addEventListener('click', function() {
		setAgreeContainerCollapse(!agreeContainer.classList.contains("collapsed"));
	});

	// 애니메이션 종료 후 높이값 처리 (유연한 레이아웃 보장)
	agreeContainer.addEventListener('transitionend', function(e) {
		if (e.propertyName === 'height' && !this.classList.contains('collapsed')) {
			this.style.height = 'auto';
		}
	});

	// 개별 체크박스 상태 변경 시 전체 동의 체크박스 상태 업데이트
	function updateSubmitBtn() {
		const allChecked = Array.from(agrees).every(chk => chk.checked);
		if (agreeAll.checked !== allChecked) {
			agreeAll.checked = allChecked;
		}
	}

	// 전체 동의 체크박스 클릭 시 하위 항목 일괄 제어
	agreeAll.addEventListener("change", function() {
		agrees.forEach(chk => chk.checked = this.checked);
	});

	agrees.forEach(chk => chk.addEventListener("change", updateSubmitBtn));

	/**
	 * 본인인증 및 회원가입 진행 로직
	 */
	// 휴대폰 번호 옆 '확인' 버튼 클릭 시 인증번호 발송 요청
	btnPhoneConfirm.addEventListener('click', function() {
		// 활성 상태(자리수 만족) 확인
		if (!this.classList.contains('active')) {
			if (phoneInput.value.length === 0) {
				showToast("휴대폰 번호를 입력해 주세요.");
			} else {
				showToast("휴대폰 번호를 확인해주세요.");
			}
			return;
		}

		// 재요청 모드인 경우 (인증번호가 이미 발송된 상태)
		if (isAuthRequested) {
			if (timeLeft > 0) {
				showToast("인증번호(3분) 만료 후 인증번호 재요청이 가능합니다.");
			} else {
				showLoading(() => {
					startTimer();
					showToast("인증번호가 재발송되었습니다.");
				});
			}
			return;
		}

		// 필수 약관 동의 여부 확인
		let currentRequiredAgrees = [...requiredAgrees];
		const chkSkt = document.getElementById("chkSkt");
		const stplatSkt = document.getElementById('stplatSkt');
		if (chkSkt && stplatSkt && stplatSkt.style.display !== 'none') {
			currentRequiredAgrees.push(chkSkt);
		}
		
		const chkSktAdd1 = document.getElementById("chkSktAdd1");
		const stplatSktAdd1 = document.getElementById('stplatSktAdd1');
		if (chkSktAdd1 && stplatSktAdd1 && stplatSktAdd1.style.display !== 'none') {
			currentRequiredAgrees.push(chkSktAdd1);
		}

		const chkSktAdd2 = document.getElementById("chkSktAdd2");
		const stplatSktAdd2 = document.getElementById('stplatSktAdd2');
		if (chkSktAdd2 && stplatSktAdd2 && stplatSktAdd2.style.display !== 'none') {
			currentRequiredAgrees.push(chkSktAdd2);
		}
		
		const requiredChecked = currentRequiredAgrees.every(chk => chk && chk.checked);
		if (!requiredChecked) {
			// 필수 약관 미동의 시 커스텀 팝업 노출
			document.getElementById('sidePopup').classList.add('active');
			document.querySelector('.dim').style.display = 'block';
			return;
		}

		processPhoneAuth();
	});

	// 실제 인증번호 발송 프로세스 분리
	function processPhoneAuth() {
		// SKT 선택 시 주민등록번호 유효성 확인
		const isSktSelected = document.querySelector('input[name="telCdRadio"]:checked').value === 'SKT';
		if (isSktSelected && juminInput && juminInput.value.length < 8) {
			showToast("주민등록번호를 확인해주세요.");
			return;
		}

		// 휴대폰 번호 유효 자리수 재확인
		if (phoneInput.value.length < 11) {
			showToast("휴대폰 번호를 확인해주세요.");
			return;
		}

		// 010으로 시작하지 않는 경우 팝업 노출
		if (!phoneInput.value.startsWith('010')) {
			showToast('010으로 시작하는 번호만 입력이 가능합니다.');
			return;
		}

		// reCAPTCHA 실행 (검증 완료되면 executePhoneAuthLogic 콜백 호출)
		/* 테스트를 위해 임시 비활성화
		try {
			grecaptcha.execute();
		} catch(e) {
			console.error("reCAPTCHA 실행 오류:", e);
			// 스크립트가 로드되지 않았거나 기타 오류 발생 시 바로 콜백 실행 (테스트/로컬 환경 대응)
			executePhoneAuthLogic("mock-token");
		}
		*/
		
		// 테스트용: 바로 로직 실행
		executePhoneAuthLogic("mock-token");
	}

	window.executePhoneAuthLogic = function(token) {
		if (token === "") {
			showToast("자동 입력 방지 검증에 실패했습니다. 다시 시도해주세요.");
			return;
		}

		// 로딩 화면(서버통신 1초) 보여준 후 로직 실행
		showLoading(() => {
			try { grecaptcha.reset(); } catch(e) {} // 콜백 후 리셋 처리

			// 010으로 시작하지만 정상적인 번호가 아닌 경우 인증번호 발송 실패 팝업 노출
			if (phoneInput.value !== '01012341234') {
				const authFailPopup = document.getElementById('authFailPopup');
				if (authFailPopup) {
					authFailPopup.classList.add('active');
					document.querySelector('.dim').style.display = 'block';
				}
				return;
			}

			// 인증 상태 초기화 및 인증번호 입력창 표시
			isAuthRequested = true;
			if (juminFieldGroup) juminFieldGroup.classList.remove('active'); // 인증 요청 시 active 제거
			btnPhoneConfirm.querySelector('span').textContent = '재요청'; // 버튼 텍스트 변경
			phoneInput.readOnly = true; // 휴대폰번호 입력 창 읽기 전용으로 변경
			phoneInput.style.opacity = '0.5'; // 시각적으로 비활성화된 느낌 부여
			if (juminInput) {
				juminInput.readOnly = true;
				juminInput.style.opacity = '0.5';
			}
			
			// 통신사 선택 비활성화
			telecomRadios.forEach(radio => radio.disabled = true);
			document.querySelector('.telecom').classList.add('disabled');

			// 약관동의 비활성화
			agreeAll.disabled = true;
			agrees.forEach(chk => chk.disabled = true);
			document.querySelector('.terms-agree').classList.add('disabled');

			auth_wrap.classList.add("active");
			
			const tempDisplay = helpTooltip.style.display;
			helpTooltip.style.display = "none";
			auth_wrap.style.height = `${auth_wrap.scrollHeight}px`;
			helpTooltip.style.display = tempDisplay;
			
			startTimer(); // 타이머 시작
			
			// 인증번호 발송 완료 팝업 노출
			const authSuccessPopup = document.getElementById('authSuccessPopup');
			if (authSuccessPopup) {
				authSuccessPopup.classList.add('active');
				document.querySelector('.dim').style.display = 'block';
			}
		});
	};

	// 사이드 팝업 (약관동의 유도) 이벤트 핸들링
	const sidePopup = document.getElementById('sidePopup');
	const btnSideCancel = document.getElementById('btnSideCancel');
	const btnSideConfirm = document.getElementById('btnSideConfirm');

	btnSideCancel.addEventListener('click', function() {
		sidePopup.classList.remove('active');
		document.querySelector('.dim').style.display = 'none';
	});

	btnSideConfirm.addEventListener('click', function() {
		// 1. 모든 약관 체크 처리
		agreeAll.checked = true;
		agrees.forEach(chk => chk.checked = true);
		
		// 2. 팝업 및 딤 닫기
		sidePopup.classList.remove('active');
		document.querySelector('.dim').style.display = 'none';
		
		// 3. 인증 프로세스 진행
		processPhoneAuth();
	});

	// 인증번호 발송 실패 팝업 닫기
	const btnAuthFailConfirm = document.getElementById('btnAuthFailConfirm');
	if (btnAuthFailConfirm) {
		btnAuthFailConfirm.addEventListener('click', function() {
			document.getElementById('authFailPopup').classList.remove('active');
			document.querySelector('.dim').style.display = 'none';
		});
	}

	// 인증번호 발송 완료 팝업 닫기
	const btnAuthSuccessConfirm = document.getElementById('btnAuthSuccessConfirm');
	if (btnAuthSuccessConfirm) {
		btnAuthSuccessConfirm.addEventListener('click', function() {
			document.getElementById('authSuccessPopup').classList.remove('active');
			document.querySelector('.dim').style.display = 'none';
		});
	}

	// 하단 최종 '전화번호 안심로그인 유료가입' 버튼 클릭 이벤트
	primaryBtn.addEventListener("click", function(){
		// 먼저 번호 확인 과정을 거쳤는지 확인
		if (!isAuthRequested) {
			if (phoneInput.value.length > 0) {
				showToast("확인 버튼을 눌러 인증을 진행해주세요.");
			} else {
				showToast(`휴대폰번호를 입력해서 인증을 해주세요.`);
			}
			return;
		}

		// 필수 약관 체크 재확인
		const requiredChecked = requiredAgrees.every(chk => chk && chk.checked);
		if (!requiredChecked) {
			showToast("필수 약관에 동의해 주세요.");
			return;
		}

		// 인증번호 입력 확인
		if (authInput.value.length < 6) {
			showToast("인증번호 6자리를 입력해 주세요.");
			return;
		}

		// 가입 절차 완료 로직 분리
		function completeJoin() {
			clearInterval(timerInterval);
			
			// html 태그에 complete 클래스 추가
			document.documentElement.classList.add('complete');

			const sectionInput = document.getElementById('sectionInput');
			const sectionComplete = document.getElementById('sectionComplete');

			if (sectionInput) sectionInput.style.display = 'none';
			if (sectionComplete) sectionComplete.style.display = 'flex';

			const sidePopup2 = document.getElementById('sidePopup2');
			if (sidePopup2) {
				sidePopup2.classList.add('active');
				document.querySelector('.dim').style.display = 'block';
				
				// 확인 버튼 클릭 시 결과 페이지(popupCont05) 표시
				document.getElementById('btnSideConfirm2').onclick = function() {
					sidePopup2.classList.remove('active');
					document.querySelector('.dim').style.display = 'none';
					document.getElementById('popupCont05').style.display = 'block';
				};
			} else {
				document.getElementById('popupCont05').style.display = 'block';
			}
		}

		showLoading(() => {
			// 통신사 확인
			const selectedTelecom = document.querySelector('input[name="telCdRadio"]:checked').value;
			
			if (selectedTelecom === 'KT') {
				// KT인 경우 안내 팝업 노출
				const ktPopup = document.querySelector('.layer.signUp_kt');
				ktPopup.style.display = 'block';
				document.querySelector('.dim').style.display = 'block';

				// 팝업 내 확인 버튼(유료가입) 클릭 시
				ktPopup.querySelector('.next').onclick = function() {
					ktPopup.style.display = 'none';
					document.querySelector('.dim').style.display = 'none';
					StatisticsManager.track('signup'); // KT 가입 추적
					completeJoin();
				};

				// 팝업 내 취소/닫기 버튼 클릭 시
				const closeKtPopup = function() {
					ktPopup.style.display = 'none';
					document.querySelector('.dim').style.display = 'none';
				};
				ktPopup.querySelector('.btn_cancel').onclick = closeKtPopup;
				ktPopup.querySelector('.btn_close').onclick = closeKtPopup;
			} else {
				// KT가 아닌 경우 바로 완료 처리
				StatisticsManager.track('signup'); // 일반 가입 추적
				completeJoin();
			}
		});
	});

	/**
	 * 타이머 로직
	 */
	// 타이머 가동 함수
	function startTimer() {
		clearInterval(timerInterval);
		timeLeft = 180; // 3분으로 초기화
		updateTimerDisplay();
		
		timerInterval = setInterval(() => {
			timeLeft--;
			updateTimerDisplay();
			
			if (timeLeft <= 0) {
				clearInterval(timerInterval);
			}
		}, 1000);
	}

	// 타이머 디스플레이 업데이트 (MM:SS 포맷)
	function updateTimerDisplay() {
		const m = Math.floor(timeLeft / 60);
		const s = timeLeft % 60;
		timerDisplay.textContent = `0${m}:${s < 10 ? '0' : ''}${s}`;

		// 시간이 만료되면 재입력 가능하도록 활성화
		if (timeLeft <= 0) {
			phoneInput.readOnly = false;
			phoneInput.style.opacity = '1';
			if (juminInput) {
				juminInput.readOnly = false;
				juminInput.style.opacity = '1';
			}
		}
	}



	/**
	 * 기타 UI 유틸리티 (토스트, 도움말 툴팁, 팝업 닫기)
	 */
	let toastTimeout;
	// 상단 알림 토스트 팝업 표시 함수
	function showToast(message) {
		const toast = document.getElementById('toastPopup');
		const toastDim = document.getElementById('toastDim');
		if(message) toast.textContent = message;

		// 토스트 표시
		toast.classList.add('show');

		// Dim 표시 및 높이 자동 계산 (토스트 하단 + 20px)
		if (toastDim) {
			toastDim.classList.add('show');
			// 렌더링 후 정확한 높이 계산을 위해 setTimeout 사용
			setTimeout(() => {
				const toastRect = toast.getBoundingClientRect();
				// 상단 여백(toastRect.top)만큼 하단에도 추가하여 전체 높이 설정
				const dimHeight = toastRect.bottom + toastRect.top + toastRect.height / 2;
				// toastDim.style.height = dimHeight + 'px';
			}, 0);
		}

		// 토스트가 뜰 때 50ms 진동 1회 실행
		if ("vibrate" in navigator) {
			navigator.vibrate(50);
		}

		clearTimeout(toastTimeout);
		toastTimeout = setTimeout(() => {
			toast.classList.remove('show');
			if (toastDim) {
				toastDim.classList.remove('show');
				// toastDim.style.height = '0'; // 필요 시 초기화
			}
		}, 2500);
	}

	// 도움말 아이콘(?) 클릭 시 툴팁 토글
	btnHelp.addEventListener('click', function(e) {
		e.stopPropagation();
		helpTooltip.classList.toggle('active');
	});

	// 화면 다른 곳 클릭 시 열려있는 도움말 툴팁 닫기
	document.addEventListener('click', function(e) {
		if (!helpTooltip.contains(e.target) && e.target !== btnHelp) {
			helpTooltip.classList.remove('active');
		}
	});

	// '가입 완료' 등의 섹션/팝업 내 닫기 버튼 공통 연동
	const exitCompleteBtns = document.querySelectorAll('.exitBtn_complete');
	exitCompleteBtns.forEach(btn => {
		btn.addEventListener('click', function() {
			this.closest('.signUp_section').style.display = 'none';
		});
	});

	// 취소 버튼(exitBtn) 클릭 시 종료 확인 팝업
	const exitBtn = document.getElementById('exitBtn');
	if (exitBtn) {
		exitBtn.addEventListener('click', function() {
			const exitPopup = document.getElementById('exitPopup');
			if (exitPopup) {
				exitPopup.classList.add('active');
				document.querySelector('.dim').style.display = 'block';
				
				// 확인 버튼 클릭 시
				document.getElementById('btnExitConfirm').onclick = function() {
					exitPopup.classList.remove('active');
					document.querySelector('.dim').style.display = 'none';
					// 여기에 실제 종료 또는 이전 페이지 이동 로직 추가 가능
				};
				
				// 취소 버튼 클릭 시
				document.getElementById('btnExitCancel').onclick = function() {
					exitPopup.classList.remove('active');
					document.querySelector('.dim').style.display = 'none';
				};
			}
		});
	}

	/**
	 * 약관 상세 팝업 오픈 함수 (글로벌)
	 * @param {string} code - 약관 코드 (분기 처리가 필요할 경우 활용)
	 */
	window.privacyPopOpen = function(code) {
		const privacyPopup = document.getElementById('privacy01');
		if (privacyPopup) {
			privacyPopup.style.display = 'block';
			document.querySelector('.dim').style.display = 'block';
		}
	};

	// 약관 팝업 닫기 이벤트
	const privacyCloseBtn = document.querySelector('#privacy01 .btn_close');
	const privacyConfirmBtn = document.querySelector('#privacy01 .layer_footer .btn_next');

	function closePrivacyPopup() {
		document.getElementById('privacy01').style.display = 'none';
		// 만약 사이드 팝업이나 다른 알럿이 떠있는 상태가 아니라면 dim도 같이 닫기
		if (!sidePopup.classList.contains('active')) {
			document.querySelector('.dim').style.display = 'none';
		}
	}

	if (privacyCloseBtn) {
		privacyCloseBtn.addEventListener('click', closePrivacyPopup);
	}

	if (privacyConfirmBtn) {
		privacyConfirmBtn.addEventListener('click', closePrivacyPopup);
	}

	/**
	 * 7일간 보이지 않기 기능 로직
	 */
	const chkHide7 = document.getElementById('chkHide7');
	const STORAGE_KEY_HIDE = 'safeconnect_hide_until';

	// 초기 체크: 숨김 기간이 남아있는지 확인
	function checkInitialVisibility() {
		const hideUntil = localStorage.getItem(STORAGE_KEY_HIDE);
		if (hideUntil) {
			const now = new Date().getTime();
			if (now < parseInt(hideUntil)) {
				// 숨김 처리 (전체 래퍼를 숨기거나 페이지를 이탈시킴)
				document.querySelector('.safeconnect_wrap_new').style.display = 'none';
				console.log("7일간 보이지 않기 기능이 활성화되어 있습니다.");
			} else {
				// 기간 만료 시 데이터 삭제
				localStorage.removeItem(STORAGE_KEY_HIDE);
			}
		}
	}

	// 텍스트 클릭 시 (체크박스가 체크된 경우에만) localStorage 저장
	const btnHide7Action = document.getElementById('btnHide7Action');
	if (btnHide7Action && chkHide7) {
		btnHide7Action.addEventListener('click', function() {
			if (chkHide7.checked) {
				const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
				const expireTime = new Date().getTime() + sevenDaysInMs;
				localStorage.setItem(STORAGE_KEY_HIDE, expireTime);
				
				showToast("7일간 이 페이지를 보이지 않도록 설정했습니다.");
				
				// 설정 즉시 페이지 숨김 처리 (사용자 경험에 따라 다를 수 있음)
				setTimeout(() => {
					document.querySelector('.safeconnect_wrap_new').style.display = 'none';
				}, 1500);
			} else {
				showToast("먼저 체크박스를 선택해 주세요.");
			}
		});
	}

	// 실행
	checkInitialVisibility();

	/**
	 * iOS Safari WebView Input Focus 이슈 해결
	 * 포커스가 해제될 때(focusout) 화면을 강제로 스크롤 위로 올려서(scrollTo) 
	 * 뷰포트 좌표가 틀어져 버튼이 안 눌리는 현상을 방지합니다.
	 */
	document.addEventListener('focusout', function(e) {
		const target = e.target;
		const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
		
		if (isInput) {
			// iOS 환경 체크 (필요한 경우 강화 가능)
			const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
			
			if (isIOS) {
				setTimeout(() => {
					window.scrollTo(0, window.scrollY || document.documentElement.scrollTop);
				}, 50);
			}
		}
	});