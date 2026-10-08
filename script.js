const expenses = [];

const itemInput = document.getElementById("item");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const list = document.getElementById("list");
const empty = document.getElementById("empty");

function money(number) {
  return number.toLocaleString("ko-KR") + "원";
}

function render() {
  list.innerHTML = "";

  empty.style.display = expenses.length === 0 ? "block" : "none";

  expenses.forEach((expense, index) => {
    const row = document.createElement("div");
    row.className = "expense-row";

    row.innerHTML = `
      <div><strong>${escapeHtml(expense.item)}</strong></div>
      <div class="category">${escapeHtml(expense.category)}</div>
      <div><strong>${money(expense.amount)}</strong></div>
      <button class="delete" onclick="removeExpense(${index})">×</button>
    `;

    list.appendChild(row);
  });

  updateStats();
}

function updateStats() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const count = expenses.length;
  const average = count === 0 ? 0 : Math.round(total / count);

  document.getElementById("total").textContent = money(total);
  document.getElementById("count").textContent = count + "회";
  document.getElementById("average").textContent = money(average);
}

function addExpense() {
  const item = itemInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;

  if (!item) {
    alert("소비 항목을 입력해주세요.");
    return;
  }

  if (!amount || amount <= 0) {
    alert("금액을 올바르게 입력해주세요.");
    return;
  }

  expenses.push({
    item,
    amount,
    category
  });

  itemInput.value = "";
  amountInput.value = "";

  render();
}

function removeExpense(index) {
  expenses.splice(index, 1);
  render();
}

function analyze() {
  if (expenses.length === 0) {
    alert("먼저 소비 내역을 추가해주세요.");
    return;
  }

  const categoryTotals = {};

  expenses.forEach(expense => {
    categoryTotals[expense.category] =
      (categoryTotals[expense.category] || 0) + expense.amount;
  });

  const sorted = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);

  const [culprit, culpritAmount] = sorted[0];
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const percentage = Math.round((culpritAmount / total) * 100);

  document.getElementById("result").classList.remove("hidden");
  document.getElementById("culpritName").textContent =
    `${culprit} · ${money(culpritAmount)}`;

  const report = makeReport(culprit, culpritAmount, percentage, total);
  document.getElementById("report").textContent = report;

  document.getElementById("badge").textContent = makeBadge(culprit, percentage);

  renderChart(sorted, total);

  document.getElementById("result").scrollIntoView({
    behavior: "smooth"
  });
}

function makeReport(culprit, amount, percentage, total) {
  const messages = {
    "배달": `이번 달 통장을 가장 세게 공격한 범인은 배달입니다. ${money(amount)}를 사용해 전체 지출의 ${percentage}%를 차지했습니다. 배달앱과 너무 친해진 건 아닌지 한 번 생각해보세요.`,
    "카페": `이번 달 통장 털범인은 카페입니다. ${money(amount)}를 사용했습니다. 카페가 생활 공간인지 소비 공간인지 이제는 구분이 필요해 보입니다.`,
    "쇼핑": `이번 달 통장 털범인은 쇼핑입니다. ${money(amount)}를 사용했습니다. "이건 꼭 필요했어"라고 생각한 물건이 몇 개였는지 한번 돌아보세요.`,
    "식비": `이번 달 통장 털범인은 식비입니다. ${money(amount)}를 사용했습니다. 먹는 건 중요하지만 통장도 밥을 먹어야 합니다.`,
    "교통": `이번 달 통장 털범인은 교통비입니다. ${money(amount)}를 사용했습니다. 이동이 많았던 달인지 확인해보세요.`,
    "구독": `이번 달 통장 털범인은 구독입니다. ${money(amount)}가 반복 결제로 빠져나갔습니다. 안 쓰는 구독이 숨어 있지 않은지 확인해보세요.`,
    "기타": `이번 달 통장 털범인은 기타 지출입니다. ${money(amount)}를 사용했습니다. 정체를 알 수 없는 소비가 많다는 건 소비 습관을 다시 볼 필요가 있다는 뜻일지도 모릅니다.`
  };

  return messages[culprit] ||
    `${culprit}에 ${money(amount)}를 사용했습니다. 전체 지출의 ${percentage}%입니다. 이번 달 소비 습관을 한 번 돌아보세요.`;
}

function makeBadge(culprit, percentage) {
  if (culprit === "배달" && percentage >= 40) return "배달 VIP";
  if (culprit === "카페" && percentage >= 30) return "카페 귀족";
  if (culprit === "쇼핑" && percentage >= 35) return "온라인 쇼핑 영주";
  if (culprit === "구독" && percentage >= 25) return "구독 서비스 주민";
  if (percentage <= 20) return "통장 수호자";
  return "소비 탐정 견습생";
}

function renderChart(sorted, total) {
  const chart = document.getElementById("categoryChart");
  chart.innerHTML = "";

  sorted.forEach(([category, amount]) => {
    const percentage = Math.round((amount / total) * 100);

    const row = document.createElement("div");
    row.className = "bar-row";

    row.innerHTML = `
      <div class="bar-label">
        <span>${escapeHtml(category)}</span>
        <strong>${money(amount)} (${percentage}%)</strong>
      </div>
      <div class="bar-bg">
        <div class="bar" style="width: ${percentage}%"></div>
      </div>
    `;

    chart.appendChild(row);
  });
}

function loadSample() {
  expenses.length = 0;

  expenses.push(
    { item: "스타벅스", amount: 5500, category: "카페" },
    { item: "배달의민족", amount: 18000, category: "배달" },
    { item: "편의점", amount: 7000, category: "식비" },
    { item: "넷플릭스", amount: 17000, category: "구독" },
    { item: "배달의민족", amount: 22000, category: "배달" },
    { item: "스타벅스", amount: 6500, category: "카페" },
    { item: "온라인 쇼핑", amount: 35000, category: "쇼핑" },
    { item: "배달의민족", amount: 16000, category: "배달" }
  );

  render();
  analyze();
}

function resetAll() {
  expenses.length = 0;
  document.getElementById("result").classList.add("hidden");
  render();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.getElementById("addBtn").addEventListener("click", addExpense);
document.getElementById("analyzeBtn").addEventListener("click", analyze);
document.getElementById("sampleBtn").addEventListener("click", loadSample);
document.getElementById("resetBtn").addEventListener("click", resetAll);

amountInput.addEventListener("keydown", event => {
  if (event.key === "Enter") addExpense();
});

render();
