
if(document.querySelector("#keypad_container")) {
    document.querySelector("#keypad_container").innerHTML = "";
}


const keypadForm = document.querySelector("#keypad_container");
let keypadForm_length;
const MAX_COUNT = 6;

// 12칸짜리 배열 생성
const result = [];



/* 버튼 그리기 */
function paintBtn(newBtn, type){
    const btnType = type;
    const button = document.createElement('button');
    button.setAttribute("type", "button");
    if(btnType === "face") {
        button.classList.add("btn_face");
    } else if( btnType === "back") {
        button.classList.add("btn_back");
    } else {
        button.classList.add("btn_number");
    }
    const span = document.createElement('span');
    span.innerText = newBtn;
    button.appendChild(span);
    keypadForm.appendChild(button);
}


let btnAdd = document.querySelector(".btnAdd");
btnAdd.addEventListener("click", function(){
	for(let i = 0; i < result.length; i++) {
		if(i === 9) {
			paintBtn(result[i], "face");
		} else if(i === 11) {
			paintBtn(result[i], "back");
		} else {
			paintBtn(result[i]);
		}
	}
	keypadForm_length = keypadForm.querySelectorAll("button");
	btnClickAct();
}, { once: true });


function init(){
	for(let i = 0; i < result.length; i++) {
		if(i === 9) {
			paintBtn(result[i], "face");
		} else if(i === 11) {
			paintBtn(result[i], "back");
		} else {
			paintBtn(result[i]);
		}
	}
	keypadForm_length = keypadForm.querySelectorAll("button");
	btnClickAct();
}


/* 번호 섞기 */
function getCustomShuffledArray() {
	// 1부터 10까지 숫자 배열 생성
	const numbers = Array.from({ length: 10 }, (_, i) => i);

	// Fisher-Yates 방식으로 배열을 무작위로 섞음
	for (let i = numbers.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[numbers[i], numbers[j]] = [numbers[j], numbers[i]];
	}

	// 0~11까지 반복 (총 12개)
	for (let i = 0; i < 12; i++) {
		if (i === 9) {
			result.push('face'); // 10번째 (index 9)에 'face'
		} else if (i === 11) {
			result.push('back'); // 12번째 (index 11)에 'back'
		} else {
			result.push(numbers.shift()); // 나머지는 섞인 숫자 채우기
		}
	}
	return result;
}
getCustomShuffledArray();


let sss = [];

/* 각 버튼 클릭시 */
function btnClickAct(){
	keypadForm_length.forEach(function(item){
		item.addEventListener("click", function(){			
			if(item.closest(".btn_face")) {
				btnclickFaceId();
			} else if(item.closest(".btn_back")) {
				btnClickBack(sss);
			} else {
				btnClickNum(item);
            }
		})
	})
}


// 숫자 버튼 클릭
function btnClickNum(item){
	if(sss.length == 6) {
		sss = [];
		return false;
	}
	if(sss.length < MAX_COUNT) {
		// console.log(item.innerText);
		sss.push(item.innerText);
		console.log(sss);
		btnEffect(item); // 버튼 효과
	} 
	else {
		console.log("그만! 그만! 그만 눌러 쫌!");
	}
}


// 삭제 클릭
function btnClickBack(item){
	if(item.length > 0) {
		sss.pop();
	} else {
		console.log("삭제할 입력값 없음.")
	}
	console.log(sss);
}

// faceId 버튼 클릭
function btnclickFaceId(){
	alert("안면인식");
}



// 버튼 효과
function btnEffect(btnItem){
    const btn = btnItem;
    btn.classList.add("active");
    btn.addEventListener("animationend", function(){
        btn.classList.remove("active");
    })
}


// 
btnAdd.click();
// init();