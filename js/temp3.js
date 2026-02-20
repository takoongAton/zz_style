// 키패드 컨테이너 있으면 비우기
if (document.querySelector("#keypad_container")) {
  document.querySelector("#keypad_container").innerHTML = "";
}

const keypadForm = document.querySelector("#keypad_container");
let keypadForm_length;  // 버튼들 담을 변수
const MAX_COUNT = 6;    // 최대 6자리까지 입력

// 키패드에 넣을 데이터 (숫자 + face, back)
const result = [];

/* 버튼 하나 그리기 */
function paintBtn(newBtn, type) {
  const button = document.createElement("button");
  button.setAttribute("type", "button");
  if (type === "face") {
    button.classList.add("btn_face");
  } else if (type === "back") {
    button.classList.add("btn_back");
  } else {
    button.classList.add("btn_number");
  }
  const span = document.createElement("span");
  span.innerText = newBtn;
  button.appendChild(span);
  keypadForm.appendChild(button);
}

/* 번호 섞기 - 0~9 섞고 10번째에 face, 12번째에 back 넣기 */
function getCustomShuffledArray() {
  const numbers = [];
  for (let i = 0; i < 10; i++) {
    numbers.push(i);
  }
  // Fisher-Yates 방식으로 섞기
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = numbers[i];
    numbers[i] = numbers[j];
    numbers[j] = temp;
  }
  // 12칸 채우기 (9번째=face, 11번째=back)
  for (let i = 0; i < 12; i++) {
    if (i === 9) {
      result.push("face");
    } else if (i === 11) {
      result.push("back");
    } else {
      result.push(numbers.shift());
    }
  }
  return result;
}
getCustomShuffledArray();

// 사용자가 입력한 숫자 저장
let sss = [];

/* 키패드 버튼 그리기 + 클릭 이벤트 붙이기 */
let btnAdd = document.querySelector(".btnAdd");
btnAdd.addEventListener("click", function () {
  for (let i = 0; i < result.length; i++) {
    if (i === 9) {
      paintBtn(result[i], "face");
    } else if (i === 11) {
      paintBtn(result[i], "back");
    } else {
      paintBtn(result[i], "number");
    }
  }
  keypadForm_length = keypadForm.querySelectorAll("button");
  btnClickAct();
}, { once: true });

/* 각 버튼 클릭했을 때 */
function btnClickAct() {
  for (let i = 0; i < keypadForm_length.length; i++) {
    const item = keypadForm_length[i];
    item.addEventListener("click", function () {
      if (item.closest(".btn_face")) {
        btnclickFaceId();
      } else if (item.closest(".btn_back")) {
        btnClickBack();
      } else {
        btnClickNum(item);
      }
    });
  }
}

// 숫자 버튼 클릭
function btnClickNum(item) {
  if (sss.length === 6) {
    sss = [];
    return;
  }
  if (sss.length < MAX_COUNT) {
    sss.push(item.innerText);
    console.log("입력값:", sss);
    btnEffect(item);
  } else {
    console.log("6자리까지 입력 가능합니다.");
  }
}

// 삭제(back) 버튼 클릭
function btnClickBack() {
  if (sss.length > 0) {
    sss.pop();
    console.log("삭제 후:", sss);
  } else {
    console.log("삭제할 입력값 없음.");
  }
}

// 안면인식 버튼 클릭
function btnclickFaceId() {
  alert("안면인식");
}

// 버튼 눌렀을 때 효과
function btnEffect(btnItem) {
  btnItem.classList.add("active");
  btnItem.addEventListener("animationend", function () {
    btnItem.classList.remove("active");
  }, { once: true });
}

// 페이지 로드 시 키패드 그리기
btnAdd.click();
