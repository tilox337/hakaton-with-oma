const content = document.getElementById("app-content");
const toast = document.getElementById("toast");
const savedCount = document.getElementById("saved-count");

const tasks = [
  {
    id: "room",
    icon: "🛋️",
    title: "Уютная комната",
    desc: "Обновить интерьер без ремонта",
  },
  {
    id: "storage",
    icon: "🧺",
    title: "Умное хранение",
    desc: "Порядок даже в маленькой квартире",
  },
  {
    id: "balcony",
    icon: "🪴",
    title: "Балкон мечты",
    desc: "Создать место для отдыха",
  },
  {
    id: "light",
    icon: "💡",
    title: "Новое освещение",
    desc: "Сделать дом уютнее",
  },
  {
    id: "season",
    icon: "🍂",
    title: "Дом к сезону",
    desc: "Подготовить пространство к переменам",
  },
  {
    id: "daily",
    icon: "🛠️",
    title: "Бытовая задача",
    desc: "Найти простое решение",
  },
];

const productSets = {
  room: [
    { name: "Декоративная наволочка", price: 19, icon: "🛏️" },
    { name: "Настольный светильник", price: 49, icon: "💡" },
    { name: "Короб для хранения", price: 25, icon: "🧺" },
    { name: "Небольшой декор", price: 26, icon: "🏺" },
  ],
  storage: [
    { name: "Короб для хранения", price: 25, icon: "🧺" },
    { name: "Органайзер для ящика", price: 18, icon: "▦" },
    { name: "Настенная полка", price: 39, icon: "🪵" },
    { name: "Крючки для вещей", price: 12, icon: "🪝" },
  ],
  balcony: [
    { name: "Горшок для растений", price: 16, icon: "🪴" },
    { name: "Уличный светильник", price: 35, icon: "💡" },
    { name: "Складной стул", price: 59, icon: "🪑" },
    { name: "Ящик для хранения", price: 25, icon: "🧺" },
  ],
  light: [
    { name: "Настольный светильник", price: 49, icon: "💡" },
    { name: "Лампочка тёплого света", price: 9, icon: "🔆" },
    { name: "Ночник", price: 25, icon: "🌙" },
  ],
  season: [
    { name: "Короб для хранения", price: 25, icon: "🧺" },
    { name: "Уплотнитель для окон", price: 14, icon: "🏠" },
    { name: "Крючки для хранения", price: 12, icon: "🪝" },
  ],
  daily: [
    { name: "Базовый набор инструментов", price: 35, icon: "🛠️" },
    { name: "Крепёжный набор", price: 12, icon: "🔩" },
    { name: "Рулетка", price: 9, icon: "📏" },
  ],
};

const state = {
  page: "home",
  task: "room",
  budget: 150,
  style: "cozy",
  chosen: "balanced",
  saved: [],
  cart: [],
  completed: [],
  isOrderModalOpen: false,
  deliveryService: false,
  loaderService: false,
};

function money(value) {
  return `${value} BYN`;
}
function currentTask() {
  return tasks.find((t) => t.id === state.task) || tasks[0];
}
function products() {
  return productSets[state.task] || productSets.room;
}
function total(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
function toastMessage(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastMessage.timer);
  toastMessage.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}
function updateChrome() {
  savedCount.textContent = state.saved.length;
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.dataset.page === state.page ||
        (state.page === "choose" && btn.dataset.page === "projects") ||
        (["results", "detail"].includes(state.page) &&
          btn.dataset.page === "projects"),
    );
  });
}
function go(page) {
  state.page = page;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function selectTask(id) {
  state.task = id;
  state.chosen = "balanced";
  go("choose");
}
function updateModalPrice() {
  const priceElement = document.getElementById("modal-total-price");
  if (!priceElement) return;

  const itemsTotal = total(state.cart);
  const deliveryPrice = state.deliveryService ? 15 : 0;
  const loaderPrice = state.loaderService ? 25 : 0;
  const finalTotal = itemsTotal + deliveryPrice + loaderPrice;

  priceElement.textContent = money(finalTotal);
}

function makeProject(name, subset, description, color) {
  const list = subset.filter((item) => item.price <= Number(state.budget));
  const usable = list.length ? list : subset.slice(0, 1);
  const sum = total(usable);
  return `<article class="project-card">
    <div class="project-banner ${color || ""}">
      <div><span class="eyebrow">ГОТОВОЕ РЕШЕНИЕ</span><h2 style="margin-top:7px">${name}</h2></div>
      <span class="big-icon">${currentTask().icon}</span>
    </div>
    <div class="project-body">
      <p>${description}</p>
      <div class="row between" style="margin-bottom:13px"><div class="price">${money(sum)} <small>примерно</small></div><span class="eyebrow">${usable.length} товара</span></div>
      <button class="btn full" data-action="open-project" data-preset="${name}">Посмотреть решение →</button>
    </div>
  </article>`;
}
function renderHome() {
  return `<section class="hero">
    <div class="eyebrow">ПРОСТРАНСТВО ДЛЯ ТВОЕЙ ЖИЗНИ</div>
    <h1>Дом, в котором<br>хорошо.</h1>
    <p>Идеи, товары и простые решения для дома — с учётом твоих задач и бюджета.</p>
    <button class="btn" data-action="start">Создать свой проект <span>→</span></button>
  </section>
  <div class="section-head"><h2>Что хочешь улучшить?</h2><span class="eyebrow">01 / 06</span></div>
  <div class="grid">${tasks
    .map(
      (t) => `<button class="tile" data-action="task" data-id="${t.id}">
    <span class="tile-icon">${t.icon}</span><strong>${t.title}</strong><small>${t.desc}</small>
  </button>`,
    )
    .join("")}</div>
  <div class="section-head"><h2>Идеи для вдохновения</h2><button class="text-btn" data-page="projects">Все проекты →</button></div>
  <button class="feature-card" style="width:100%;text-align:left;background:white" data-action="task" data-id="storage">
    <span class="feature-icon">🧺</span><span class="grow"><h3>Порядок без лишних вещей</h3><p>Продуманные решения для хранения в маленьком пространстве.</p></span><span>›</span>
  </button>
  <button class="feature-card" style="width:100%;text-align:left;background:white" data-action="task" data-id="balcony">
    <span class="feature-icon">🪴</span><span class="grow"><h3>Балкон для отдыха</h3><p>Небольшой проект, который можно делать постепенно.</p></span><span>›</span>
  </button>
  <p class="footer-note">ОМА LIFE — концепт цифрового помощника по дому.</p>`;
}
function renderChoose() {
  return `<button class="back" data-page="home">← На главную</button>
    <div class="eyebrow">ТВОЙ ПРОЕКТ · ШАГ 1 ИЗ 2</div><h1>Давай подберём решение</h1>
    <p>Несколько простых ответов — и у тебя будет план с товарами и примерной стоимостью.</p>
    <div class="form-group"><label>1. Что хочешь улучшить?</label><div class="options">
      ${tasks.map((t) => `<label class="option"><input type="radio" name="task" value="${t.id}" ${state.task === t.id ? "checked" : ""}><span>${t.icon}</span><span><strong>${t.title}</strong><br><small style="color:var(--muted)">${t.desc}</small></span></label>`).join("")}
    </div></div>
    <div class="form-group"><label>2. Какой у тебя бюджет?</label><div class="chips">
      ${[50, 100, 150, 250].map((n) => `<button class="chip ${state.budget === n ? "active" : ""}" data-action="budget" data-value="${n}">До ${n} BYN</button>`).join("")}
    </div></div>
    <div class="form-group"><label>3. Что важнее?</label><div class="options">
      <label class="option"><input type="radio" name="style" value="cozy" ${state.style === "cozy" ? "checked" : ""}><span>✨</span><span>Уют и атмосфера</span></label>
      <label class="option"><input type="radio" name="style" value="practical" ${state.style === "practical" ? "checked" : ""}><span>▦</span><span>Практичность и порядок</span></label>
      <label class="option"><input type="radio" name="style" value="minimal" ${state.style === "minimal" ? "checked" : ""}><span>♡</span><span>Минимум вещей и затрат</span></label>
    </div></div>
    <div class="note">Подборки и цены сейчас демонстрационные. В настоящем сервисе они будут связаны с актуальным каталогом ОМА.</div>
    <button class="btn full" data-action="show-results">Подобрать решения →</button>`;
}
function projectOptions() {
  const p = products();
  const cheap = p.slice(0, Math.min(2, p.length));
  const balanced = p.slice(0, Math.min(3, p.length));
  const complete = p.slice(0, Math.min(4, p.length));
  const fitBudget = (items) => {
    let out = [],
      sum = 0;
    for (const item of items)
      if (sum + item.price <= Number(state.budget)) {
        out.push(item);
        sum += item.price;
      }
    return out.length ? out : [items[0]];
  };
  return [
    {
      id: "simple",
      name: "Маленькие изменения",
      desc: "Начать с пары полезных деталей",
      items: fitBudget(cheap),
      color: "",
    },
    {
      id: "balanced",
      name: state.style === "practical" ? "Практичный порядок" : "Больше уюта",
      desc: "Сбалансированный вариант для твоей задачи",
      items: fitBudget(balanced),
      color: "gold",
    },
    {
      id: "complete",
      name: "Комплексное решение",
      desc: "Больше возможностей в рамках бюджета",
      items: fitBudget(complete),
      color: "blue",
    },
  ];
}
function renderResults() {
  const opts = projectOptions();
  return `<button class="back" data-page="choose">← Изменить параметры</button>
    <div class="eyebrow">ПОДБОРКА ДЛЯ ТЕБЯ</div><h1>${currentTask().title}</h1>
    <p>Подобрали несколько вариантов с учётом твоего бюджета до ${state.budget} BYN.</p>
    ${opts
      .map(
        (o) => `<article class="project-card">
      <div class="project-banner ${o.color}"><div><span class="eyebrow">${o.items.length} ПОЗИЦИИ</span><h2 style="margin-top:7px">${o.name}</h2></div><span class="big-icon">${currentTask().icon}</span></div>
      <div class="project-body"><p>${o.desc}</p><div class="row between" style="margin-bottom:13px"><div class="price">${money(total(o.items))}</div><span style="font-size:11px;color:var(--muted)">из ${state.budget} BYN</span></div>
      <button class="btn full" data-action="choose-project" data-id="${o.id}">Выбрать этот вариант →</button></div>
    </article>`,
      )
      .join("")}
    <div class="note">Суммы и товары приведены для демонстрации идеи и не являются актуальным предложением магазина.</div>`;
}
function renderDetail() {
  const project =
    projectOptions().find((p) => p.id === state.chosen) || projectOptions()[1];
  return `<button class="back" data-page="results">← К вариантам</button>
    <div class="eyebrow">ТВОЙ ПЛАН</div><h1>${project.name}</h1>
    <p>${currentTask().title}. Сохрани проект или добавь нужные позиции в свой список покупок.</p>
    <section class="project-card"><div class="project-banner gold"><div><span class="eyebrow">ПРИМЕРНЫЙ БЮДЖЕТ</span><h2 style="margin-top:7px">${money(total(project.items))}</h2></div><span class="big-icon">✓</span></div>
      <div class="project-body"><h3>Что понадобится</h3>
      ${project.items
        .map((item, i) => {
          const inCart = state.cart.some((x) => x.name === item.name);
          return `<div class="product-row"><span class="product-symbol">${item.icon}</span><span class="product-info"><strong>${item.name}</strong><small>Демонстрационная позиция · ${i + 1}</small></span><span class="product-price">${money(item.price)}</span><button class="add-btn" aria-label="Добавить ${item.name}" data-action="add-product" data-index="${products().findIndex((p) => p.name === item.name)}">${inCart ? "✓" : "+"}</button></div>`;
        })
        .join("")}
      <hr><button class="btn full" data-action="save-project">♡ Сохранить проект</button>
      <button class="btn secondary full" style="margin-top:9px" data-page="cart">Перейти к списку покупок (${state.cart.length})</button>
      </div></section>
      <div class="note">В этой демоверсии нельзя оформить настоящий заказ. Для запуска потребуется интеграция с каталогом и корзиной ОМА.</div>`;
}
function renderProjects() {
  return `<div class="eyebrow">ИДЕИ ДЛЯ ДОМА</div><h1>Проекты, с которых легко начать</h1>
    <p>Выбери задачу — сервис подберёт варианты и примерный бюджет.</p>
    <div class="grid" style="margin-top:18px">${tasks.map((t) => `<button class="tile" data-action="task" data-id="${t.id}"><span class="tile-icon">${t.icon}</span><strong>${t.title}</strong><small>${t.desc}</small></button>`).join("")}</div>
    <div class="section-head"><h2>Популярные направления</h2></div>
    ${makeProject("Порядок без лишних вещей", products().slice(0, 2), "Начни с небольших изменений.", "")}
    <button class="btn full" data-action="start">Создать персональный проект →</button>`;
}
function renderSaved() {
  if (!state.saved.length)
    return `<div class="empty"><div class="big-icon">♡</div><h2>Здесь будут твои проекты</h2><p>Сохраняй идеи, чтобы вернуться к ним, когда будет удобно.</p><button class="btn" data-action="start">Создать проект →</button></div>`;
  return `<div class="eyebrow">ТВОИ ИДЕИ</div><h1>Сохранённые проекты</h1><p>Все проекты остаются здесь в рамках этой демонстрации.</p>
    ${state.saved.map((s) => `<article class="feature-card"><span class="feature-icon">⌂</span><span class="grow"><h3>${s.title}</h3><p>${s.task} · ${money(s.price)}</p></span><button class="text-btn" data-action="open-saved" data-id="${s.id}">Открыть</button></article>`).join("")}`;
}
function renderMyHome() {
  return `<div class="eyebrow">ТВОЁ ПРОСТРАНСТВО</div><h1>Мой дом</h1><p>Твои задачи, планы и покупки — в одном месте.</p>
    <div class="stat-grid"><div class="stat"><strong>${state.saved.length}</strong><small>сохранённых проекта</small></div><div class="stat"><strong>${state.cart.length}</strong><small>позиций в списке</small></div><div class="stat"><strong>${state.completed.length}</strong><small>выполненных задач</small></div><div class="stat"><strong>${state.budget} BYN</strong><small>твой бюджет проекта</small></div></div>
    <div class="section-head"><h2>Твои планы</h2></div>
    ${state.saved.length ? state.saved.map((s) => `<div class="feature-card"><span class="feature-icon">✦</span><span class="grow"><h3>${s.title}</h3><p>${s.task}</p></span><button class="text-btn" data-action="open-saved" data-id="${s.id}">Открыть</button></div>`).join("") : `<div class="empty"><div class="big-icon">⌂</div><h2>Начни с одной идеи</h2><p>Выбери небольшую задачу для дома — и мы поможем спланировать её.</p><button class="btn" data-action="start">Запланировать улучшение</button></div>`}
    <div class="section-head"><h2>Следующий шаг</h2></div>
    <button class="feature-card" style="width:100%;text-align:left;background:white" data-action="start"><span class="feature-icon">＋</span><span class="grow"><h3>Запланировать улучшение</h3><p>Найди новую идею для дома.</p></span><span>›</span></button>`;
}
function renderCart() {
  if (!state.cart.length)
    return `<div class="eyebrow">ТВОИ ПОКУПКИ</div><h1>Список покупок</h1><div class="empty"><div class="big-icon">🛍️</div><h2>Список пока пуст</h2><p>Открой проект и нажми «+» рядом с товаром, чтобы добавить его сюда.</p><button class="btn" data-action="start">Подобрать товары →</button></div>`;

  // Стоимость только товаров
  const itemsTotal = total(state.cart);
  // Стоимость доп. услуг (например: Доставка — 15 BYN, Грузчик — 25 BYN)
  const deliveryPrice = state.deliveryService ? 15 : 0;
  const loaderPrice = state.loaderService ? 25 : 0;
  const finalTotal = itemsTotal + deliveryPrice + loaderPrice;

  return `<div class="eyebrow">ТВОИ ПОКУПКИ</div><h1>Список покупок</h1><p>Отмечай позиции по мере покупки или убирай ненужные.</p>
    ${state.cart.map((item, i) => `<div class="product-row"><span class="product-symbol">${item.icon}</span><span class="product-info"><strong>${item.name}</strong><small>${item.checked ? "Отмечено как купленное" : "В списке"}</small></span><span class="product-price">${money(item.price)}</span><button class="add-btn" data-action="toggle-cart" data-index="${i}">${item.checked ? "✓" : "○"}</button></div>`).join("")}
    <hr>
    <div class="row between"><strong>Итого по товарам</strong><span class="price">${money(itemsTotal)}</span></div>
    
    <button class="btn full" style="margin-top:18px" data-action="open-order-modal">Оформить заказ →</button>
    <button class="btn secondary full" style="margin-top:9px" data-action="clear-cart">Очистить список</button>
    
    ${
      state.isOrderModalOpen
        ? `
    <div class="modal-overlay" data-action="close-order-modal">
      <div class="modal-window" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2>Оформление заказа</h2>
          <button class="modal-close-btn" data-action="close-order-modal">✕</button>
        </div>
        <div class="modal-body">
          <h3>Ваш заказ:</h3>
          <div class="modal-goods-list">
            ${state.cart.map((item) => `<div class="modal-goods-item"><span>${item.icon} ${item.name}</span><strong>${money(item.price)}</strong></div>`).join("")}
          </div>
          
          <hr>
          
          <h3>Дополнительные услуги ОМА:</h3>
          <div class="services-list">
  <label class="service-checkbox-label" onclick="event.stopPropagation()">
    <input type="checkbox" data-action="toggle-delivery" ${state.deliveryService ? "checked" : ""}>
    <span>Доставка на дом (+15 BYN)</span>
  </label>
  <label class="service-checkbox-label" onclick="event.stopPropagation()">
    <input type="checkbox" data-action="toggle-loader" ${state.loaderService ? "checked" : ""}>
    <span>Услуги грузчика (+25 BYN)</span>
  </label>
</div>


          
          <hr>
          
          <div class="row between font-large">
            <strong>Общая стоимость:</strong>
           <span class="price-large" id="modal-total-price">${money(finalTotal)}</span>
          </div>

          
          <button class="btn full" style="margin-top:20px" data-action="submit-order">Подтвердить заказ</button>
        </div>
      </div>
    </div>
    `
        : ""
    }
    <div class="note">Это демонстрационный список. Оформление и оплата заказа не подключены.</div>`;
}

function render() {
  const pages = {
    home: renderHome,
    choose: renderChoose,
    results: renderResults,
    detail: renderDetail,
    projects: renderProjects,
    saved: renderSaved,
    myhome: renderMyHome,
    cart: renderCart,
  };
  content.innerHTML = (pages[state.page] || renderHome)();
  updateChrome();
}
function saveCurrentProject() {
  const project =
    projectOptions().find((p) => p.id === state.chosen) || projectOptions()[1];
  const id = `${state.task}-${state.chosen}`;
  if (!state.saved.some((s) => s.id === id)) {
    state.saved.push({
      id,
      title: project.name,
      task: currentTask().title,
      price: total(project.items),
      taskId: state.task,
      chosen: state.chosen,
    });
    toastMessage("Проект сохранён 💚");
  } else toastMessage("Этот проект уже сохранён");
  render();
}
content.addEventListener("change", (e) => {
  if (e.target.name === "task") state.task = e.target.value;
  if (e.target.name === "style") state.style = e.target.value;

  // Изменяем логику здесь: убираем render() и добавляем updateModalPrice()
  if (e.target.dataset.action === "toggle-delivery") {
    state.deliveryService = e.target.checked;
    updateModalPrice();
  }
  if (e.target.dataset.action === "toggle-loader") {
    state.loaderService = e.target.checked;
    updateModalPrice();
  }
});

document.addEventListener("click", (e) => {
  const pageButton = e.target.closest("[data-page]");
  const actionButton = e.target.closest("[data-action]");
  if (pageButton) {
    e.preventDefault();
    go(pageButton.dataset.page);
    return;
  }
  if (!actionButton) return;
  const action = actionButton.dataset.action;
  if (action === "start") go("choose");
  if (action === "task") selectTask(actionButton.dataset.id);
  if (action === "budget") {
    state.budget = Number(actionButton.dataset.value);
    render();
  }
  if (action === "show-results") go("results");
  if (action === "choose-project") {
    state.chosen = actionButton.dataset.id;
    go("detail");
  }
  if (action === "open-project") {
    state.chosen =
      actionButton.dataset.preset === "Маленькие изменения"
        ? "simple"
        : "balanced";
    go("detail");
  }
  if (action === "save-project") saveCurrentProject();
  if (action === "add-product") {
    const item = products()[Number(actionButton.dataset.index)];
    if (!item) return;
    const found = state.cart.findIndex((x) => x.name === item.name);
    if (found >= 0) {
      state.cart.splice(found, 1);
      toastMessage("Товар убран из списка");
    } else {
      state.cart.push({ ...item, checked: false });
      toastMessage("Добавлено в список покупок");
    }
    render();
  }
  if (action === "toggle-cart") {
    const item = state.cart[Number(actionButton.dataset.index)];
    if (item) item.checked = !item.checked;
    render();
  }
  if (action === "open-order-modal") {
    state.isOrderModalOpen = true;
    render();
  }
  if (action === "close-order-modal") {
    state.isOrderModalOpen = false;
    render();
  }
  if (action === "toggle-delivery") {
    state.deliveryService = e.target.checked;
    updateModalPrice(); // Меняет только цифру, БЕЗ вызова render()
  }
  if (action === "toggle-loader") {
    state.loaderService = e.target.checked;
    updateModalPrice(); // Меняет только цифру, БЕЗ вызова render()
  }

  if (action === "submit-order") {
    alert("Спасибо но тут ничего покачто нету, это тестовый образец");
    state.isOrderModalOpen = false;
    state.cart = []; // Очищаем корзину после успешного «заказа»
    state.deliveryService = false;
    state.loaderService = false;
    render();
    toastMessage("Заказ успешно оформлен! 🚀");
  }

  if (action === "clear-cart") {
    state.cart = [];
    render();
    toastMessage("Список очищен");
  }
  if (action === "open-saved") {
    const item = state.saved.find((s) => s.id === actionButton.dataset.id);
    if (item) {
      state.task = item.taskId;
      state.chosen = item.chosen;
      go("detail");
    }
  }
});
render();
