let allQuestions = [];
let lastQuestion = "";

// ===== 出現率設定（ここだけ触ればOK） =====
const RATE = {
  normal: 50, // 日常・安心
  love: 30,   // 恋愛観
  deep: 15,   // 結婚・将来
  spicy: 5    // 罰ゲーム枠
};
// ========================================

// JSON読み込み
fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    allQuestions = data;
  });

// spicy ON/OFF を取得（なければ常にON）
function isSpicyEnabled() {
  const el = document.getElementById("toggleSpicy");
  if (!el) return true;
  return el.checked;
}

// 重み付きランダムでカテゴリを選ぶ
function pickCategory() {
  // spicy OFF のときは、抽選対象から spicy を外す（他の比率は「固定のまま」）
  const entries = Object.entries(RATE).filter(([key]) => {
    if (key === "spicy" && !isSpicyEnabled()) return false;
    return true;
  });

  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  let r = Math.random() * total;

  for (const [key, value] of entries) {
    if (r < value) return key;
    r -= value;
  }
  return "normal";
}

// 質問を出す
function nextQuestion() {
  if (allQuestions.length === 0) {
    document.getElementById("question").textContent = "質問がありません";
    return;
  }

  let picked;
  let safety = 0;

  do {
    const category = pickCategory();

    // 念のため：spicy OFF なのに spicy を引いた場合はやり直し
    if (category === "spicy" && !isSpicyEnabled()) {
      safety++;
      continue;
    }

    const pool = allQuestions.filter(q => q.type === category);
    if (pool.length === 0) {
      safety++;
      continue;
    }

    picked = pool[Math.floor(Math.random() * pool.length)];
    safety++;
  } while (picked && picked.text === lastQuestion && safety < 10);

  if (!picked) {
    document.getElementById("question").textContent = "質問がありません";
    return;
  }

  lastQuestion = picked.text;

  // 演出（spicyだけ）
  if (picked.type === "spicy") {
    document.getElementById("question").textContent =
      "🔥 罰ゲーム質問 🔥\n（答えたくなければスキップOK）\n\n" + picked.text;
  } else {
    document.getElementById("question").textContent = picked.text;
  }
}

// コピー
function copyQuestion() {
  const text = document.getElementById("question").textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert("コピーしました");
  });
}
