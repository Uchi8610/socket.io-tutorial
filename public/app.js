//自分自身の情報を入れる
const IAM = {
  token: null,  // トークン
  name: null,   // 名前
  color: "black"  // 表示色
};

//-------------------------------------
// Socket.ioサーバへ接続
//-------------------------------------
const socket = io();

// 正常に接続したら
socket.on("connect", ()=>{
  // 表示を切り替える
  document.querySelector("#nowconnecting").style.display = "none";   // 「接続中」を非表示
  document.querySelector("#inputmyname").style.display = "block";    // 名前入力を表示
});

// トークンを発行されたら
socket.on("token", (data)=>{
  IAM.token = data.token;
});

//-------------------------------------
// STEP2. 名前の入力
//-------------------------------------
/**
 * [イベント] 名前入力フォームが送信された
 */
document.querySelector("#frm-myname").addEventListener("submit", (e)=>{
  // 規定の送信処理をキャンセル(画面遷移しないなど)
  e.preventDefault();

  // 入力内容を取得する
  const myname = document.querySelector("#txt-myname");
  if( myname.value === "" ){
    return(false);
  }

  // 名前をセット
  document.querySelector("#myname").innerHTML = myname.value;
  IAM.name = myname.value;

  // 色をセット
  IAM.color = document.querySelector("#coler-picker").value;

  // 表示を切り替える
  document.querySelector("#name-sbmit").textContent = "変更";       // 名前入力を「変更」に変更
  document.querySelector("#inputmyname").style.display = "none";    // 名前入力を非表示
  document.querySelector("#chat").style.display = "block";          // チャットを表示
  document.querySelector("#frm-post").style.display = "block";       // 入力欄を非表示
  document.querySelector("#myname").style.color = IAM.color;        // チャット色の変更
});

/**
 * [イベント] フォームが送信された
 */
const frmPost = document.querySelector("#frm-post")
frmPost.addEventListener("submit", (e)=>{
  // 規定の送信処理をキャンセル(画面遷移しないなど)
  e.preventDefault();

  // 入力内容を取得する
  const msg = document.querySelector("#msg");
  if( msg.value === "" ){
    return(false);
  }

  // Socket.ioサーバへ送信
  socket.emit("post", {
    text: msg.value,
    token: IAM.token,
    name: IAM.name,
    color: IAM.color
  });

  // 発言フォームを空にする
  msg.value = "";
});

/**
 * [イベント] 誰かが発言した
 */
const list = document.querySelector("#msglist");
socket.on("member-post", (msg)=>{
  const is_me = (msg.token === IAM.token);
  const coler = msg.color;
  addMessage(msg, is_me, coler);
});

/**
 * 発言を表示する
 *
 * @param {object}  msg
 * @param {boolean} [is_me=false]
 * @return {void}
 */
const addMessage = (msg, is_me=false, color) => {
  const list = document.querySelector("#msglist");
  const li = document.createElement("li");

  //------------------------
  // 自分の発言
  //------------------------
  if( is_me ){
    li.innerHTML = `<span class="msg-me"><span class="name">${msg.name}</span>> ${msg.text}</span>`;
  }
  //------------------------
  // 自分以外の発言
  //------------------------
  else{
    li.innerHTML = `<span class="msg-member"><span class="name">${msg.name}</span>> ${msg.text}</span>`;
  }

  li.style.color = color;

  // リストの最初に追加
  list.insertBefore(li, list.firstChild);
}

/**
 * ユーザー情報の変更
 */
const changeUserDate = () => {
  document.querySelector("#inputmyname").style.display = "block";   // 名前入力を表示
  document.querySelector("#frm-post").style.display = "none";       // 入力欄を非表示
}

/**
 * [イベント] ページの読込み完了
 */
window.onload = ()=>{
  // テキストボックスを選択する
  document.querySelector("#msg").focus();
}
