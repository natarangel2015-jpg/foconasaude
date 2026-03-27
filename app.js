const storageKey = "nutriplanner-women-v3";

const defaultState = {
  profile: {
    goalType: "loss_weight",
    activityLevel: "moderate",
    age: 30,
    height: 165,
    currentWeight: 70,
    targetWeight: 62,
    goalCalories: 1900,
    goalProtein: 120,
    goalCarbs: 180,
    goalFat: 60,
    goalWater: 2200,
    microTargets: {
      fiber: 28,
      calcium: 1000,
      iron: 18,
      vitaminC: 75,
      omega3: 1.1,
      potassium: 2600,
      sodiumMax: 2000,
    },
  },
  foods: [
    { id: crypto.randomUUID(), name: "Frango grelhado", serving: 100, calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { id: crypto.randomUUID(), name: "Batata doce cozida", serving: 100, calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
    { id: crypto.randomUUID(), name: "Iogurte natural", serving: 170, calories: 98, protein: 5.8, carbs: 7.5, fat: 3.3 },
  ],
  meals: [],
  waterByDate: {},
  progress: [],
};

const today = new Date().toISOString().slice(0, 10);
let state = loadState();

function loadState() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return structuredClone(defaultState);

  try {
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function el(id) {
  return document.getElementById(id);
}

function format(value, max = 1) {
  return Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: max });
}

function getActivityFactor(level) {
  return {
    sedentary: 1.2,
    light: 1.37,
    moderate: 1.55,
    intense: 1.72,
  }[level] ?? 1.55;
}

function getGoalPreset(goalType) {
  const presets = {
    loss_weight: { kcalAdjust: -400, proteinPct: 0.35, carbsPct: 0.35, fatPct: 0.3, waterPerKg: 35 },
    fat_loss: { kcalAdjust: -250, proteinPct: 0.4, carbsPct: 0.3, fatPct: 0.3, waterPerKg: 38 },
    muscle_gain: { kcalAdjust: 280, proteinPct: 0.3, carbsPct: 0.45, fatPct: 0.25, waterPerKg: 40 },
    glute_gain: { kcalAdjust: 200, proteinPct: 0.3, carbsPct: 0.5, fatPct: 0.2, waterPerKg: 40 },
  };
  return presets[goalType] ?? presets.loss_weight;
}

function estimateGoals(profile) {
  const age = Number(profile.age);
  const height = Number(profile.height);
  const weight = Number(profile.currentWeight);
  const activityFactor = getActivityFactor(profile.activityLevel);
  const preset = getGoalPreset(profile.goalType);

  const bmrFemale = 10 * weight + 6.25 * height - 5 * age - 161;
  const tdee = bmrFemale * activityFactor;
  const calories = Math.max(1200, Math.round(tdee + preset.kcalAdjust));

  const protein = Math.round((calories * preset.proteinPct) / 4);
  const carbs = Math.round((calories * preset.carbsPct) / 4);
  const fat = Math.round((calories * preset.fatPct) / 9);
  const water = Math.round(weight * preset.waterPerKg);

  const fiber = Math.round((calories / 1000) * 14);

  return {
    goalCalories: calories,
    goalProtein: protein,
    goalCarbs: carbs,
    goalFat: fat,
    goalWater: water,
    microTargets: {
      fiber,
      calcium: 1000,
      iron: 18,
      vitaminC: 75,
      omega3: 1.1,
      potassium: 2600,
      sodiumMax: 2000,
    },
  };
}

function getMealTotalsByDate(date) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };

  state.meals
    .filter((meal) => meal.date === date)
    .forEach((meal) => {
      const food = state.foods.find((item) => item.id === meal.foodId);
      if (!food) return;
      const factor = meal.grams / food.serving;
      totals.calories += food.calories * factor;
      totals.protein += food.protein * factor;
      totals.carbs += food.carbs * factor;
      totals.fat += food.fat * factor;
      totals.meals += 1;
    });

  return totals;
}

function renderMicroTargets() {
  const m = state.profile.microTargets;
  el("microTargets").innerHTML = `
    <article><strong>Fibra:</strong> ${format(m.fiber)} g/dia</article>
    <article><strong>Cálcio:</strong> ${format(m.calcium)} mg/dia</article>
    <article><strong>Ferro:</strong> ${format(m.iron)} mg/dia</article>
    <article><strong>Vitamina C:</strong> ${format(m.vitaminC)} mg/dia</article>
    <article><strong>Ômega-3:</strong> ${format(m.omega3)} g/dia</article>
    <article><strong>Potássio:</strong> ${format(m.potassium)} mg/dia</article>
    <article><strong>Sódio máximo:</strong> ${format(m.sodiumMax)} mg/dia</article>
  `;
}

function getGoalLabel(goalType) {
  return {
    loss_weight: "Perda de peso",
    fat_loss: "Perda de gordura (recomposição)",
    muscle_gain: "Ganho de massa",
    glute_gain: "Aumentar glúteos",
  }[goalType] ?? goalType;
}

function renderProfile() {
  const p = state.profile;
  el("goalType").value = p.goalType;
  el("activityLevel").value = p.activityLevel;
  el("age").value = p.age;
  el("height").value = p.height;
  el("currentWeight").value = p.currentWeight;
  el("targetWeight").value = p.targetWeight;
  el("goalCalories").value = p.goalCalories;
  el("goalProtein").value = p.goalProtein;
  el("goalCarbs").value = p.goalCarbs;
  el("goalFat").value = p.goalFat;
  el("goalWater").value = p.goalWater;

  const diff = p.currentWeight - p.targetWeight;
  const direction = diff > 0 ? "reduzir" : "ganhar";
  const note = p.goalType === "fat_loss" ? "Obs.: não existe perda localizada isolada; o foco é recomposição." : "";

  el("goalSummary").textContent = `Objetivo: ${getGoalLabel(p.goalType)}. Meta atual: ${direction} ${format(Math.abs(diff))} kg para chegar em ${format(p.targetWeight)} kg. ${note}`;
  renderMicroTargets();
}

function renderFoods() {
  const foodList = el("foodList");
  const mealFood = el("mealFood");
  const plannerFood = el("plannerFood");

  [foodList, mealFood, plannerFood].forEach((node) => {
    node.innerHTML = "";
  });

  state.foods.forEach((food) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>
        <strong>${food.name}</strong><br>
        <small>${food.serving}g | ${format(food.calories)} kcal | P ${format(food.protein)}g | C ${format(food.carbs)}g | G ${format(food.fat)}g</small>
      </span>
      <button type="button" class="secondary" data-food-id="${food.id}">Remover</button>
    `;
    foodList.appendChild(li);

    [mealFood, plannerFood].forEach((select) => {
      const option = document.createElement("option");
      option.value = food.id;
      option.textContent = food.name;
      select.appendChild(option);
    });
  });
}

function renderMeals() {
  const mealList = el("mealList");
  mealList.innerHTML = "";

  [...state.meals]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 15)
    .forEach((meal) => {
      const food = state.foods.find((item) => item.id === meal.foodId);
      const label = food ? food.name : "Alimento removido";
      const li = document.createElement("li");
      li.innerHTML = `
        <span>
          <strong>${meal.date}</strong> • ${meal.type}<br>
          <small>${label} (${meal.grams}g)</small>
        </span>
        <button type="button" class="secondary" data-meal-id="${meal.id}">Excluir</button>
      `;
      mealList.appendChild(li);
    });
}

function renderWater(date = today) {
  const consumed = state.waterByDate[date] ?? 0;
  const goal = Number(state.profile.goalWater);
  const pct = goal ? Math.min(100, Math.round((consumed / goal) * 100)) : 0;
  el("waterStatus").textContent = `${format(consumed)} ml de ${format(goal)} ml (${pct}%)`;
}

function renderWaterHistory() {
  const node = el("waterHistory");
  node.innerHTML = "";

  const entries = Object.entries(state.waterByDate)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 7);

  entries.forEach(([date, amount]) => {
    const li = document.createElement("li");
    li.innerHTML = `<span><strong>${date}</strong></span><small>${format(amount)} ml</small>`;
    node.appendChild(li);
  });
}

function renderProgress() {
  const progressList = el("progressList");
  progressList.innerHTML = "";

  [...state.progress]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12)
    .forEach((entry) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>
          <strong>${entry.date}</strong><br>
          <small>Peso ${format(entry.weight)} kg • Cintura ${format(entry.waist)} cm • Quadril ${format(entry.hip)} cm • Braço ${format(entry.arm)} cm</small>
        </span>
        <button type="button" class="secondary" data-progress-id="${entry.id}">Excluir</button>
      `;
      progressList.appendChild(li);
    });
}

function renderSummary(date) {
  const totals = getMealTotalsByDate(date);
  const goals = state.profile;
  const water = state.waterByDate[date] ?? 0;

  const deltaProtein = goals.goalProtein - totals.protein;
  const deltaCarbs = goals.goalCarbs - totals.carbs;
  const deltaFat = goals.goalFat - totals.fat;

  el("summary").innerHTML = `
    <article><strong>Refeições:</strong> ${totals.meals}</article>
    <article><strong>Calorias:</strong> ${format(totals.calories)} / ${format(goals.goalCalories)} kcal</article>
    <article><strong>Proteína:</strong> ${format(totals.protein)} / ${format(goals.goalProtein)} g</article>
    <article><strong>Carboidrato:</strong> ${format(totals.carbs)} / ${format(goals.goalCarbs)} g</article>
    <article><strong>Gordura:</strong> ${format(totals.fat)} / ${format(goals.goalFat)} g</article>
    <article><strong>Água:</strong> ${format(water)} / ${format(goals.goalWater)} ml</article>
    <article><strong>Falta de proteína:</strong> ${format(Math.max(0, deltaProtein))} g</article>
    <article><strong>Falta de carboidrato:</strong> ${format(Math.max(0, deltaCarbs))} g</article>
    <article><strong>Falta de gordura:</strong> ${format(Math.max(0, deltaFat))} g</article>
  `;
}

function renderPlanner() {
  const date = el("plannerDate").value;
  const foodId = el("plannerFood").value;
  const macro = el("plannerMacro").value;
  const food = state.foods.find((item) => item.id === foodId);

  if (!date || !food) {
    el("plannerOutput").innerHTML = "";
    return;
  }

  const totals = getMealTotalsByDate(date);
  const goal = state.profile;

  const remaining = {
    calories: Math.max(0, goal.goalCalories - totals.calories),
    protein: Math.max(0, goal.goalProtein - totals.protein),
    carbs: Math.max(0, goal.goalCarbs - totals.carbs),
    fat: Math.max(0, goal.goalFat - totals.fat),
  };

  const perServing = {
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
  };

  const target = remaining[macro];
  const valuePerServing = perServing[macro];
  const servingsNeeded = valuePerServing > 0 ? target / valuePerServing : 0;
  const gramsNeeded = servingsNeeded * food.serving;

  const safeGrams = Number.isFinite(gramsNeeded) ? Math.max(0, gramsNeeded) : 0;

  el("plannerOutput").innerHTML = `
    <article><strong>Data:</strong> ${date}</article>
    <article><strong>Meta restante (${macro}):</strong> ${format(target)}</article>
    <article><strong>Alimento:</strong> ${food.name}</article>
    <article><strong>Sugestão:</strong> ~${format(safeGrams)} g (${format(servingsNeeded)} porções de ${food.serving}g)</article>
    <article><small>Use como estimativa. Ajuste com acompanhamento profissional.</small></article>
  `;
}

async function searchOpenFoodFacts(query) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Falha ao consultar Open Food Facts");
  const data = await response.json();
  return data.products ?? [];
}

function renderOpenFoodResults(products) {
  const node = el("offResults");
  node.innerHTML = "";

  products.forEach((product) => {
    const name = product.product_name || "Sem nome";
    const n = product.nutriments || {};

    const result = {
      serving: Number(n["serving_quantity"] || 100),
      calories: Number(n["energy-kcal_100g"] || 0),
      protein: Number(n.proteins_100g || 0),
      carbs: Number(n.carbohydrates_100g || 0),
      fat: Number(n.fat_100g || 0),
    };

    const li = document.createElement("li");
    li.innerHTML = `
      <span>
        <strong>${name}</strong><br>
        <small>100g: ${format(result.calories)} kcal | P ${format(result.protein)} | C ${format(result.carbs)} | G ${format(result.fat)}</small>
      </span>
      <button type="button" data-off='${JSON.stringify({ name, ...result })}'>Usar</button>
    `;
    node.appendChild(li);
  });
}

function applyAutomaticGoals() {
  const profileInput = {
    goalType: el("goalType").value,
    activityLevel: el("activityLevel").value,
    age: Number(el("age").value),
    height: Number(el("height").value),
    currentWeight: Number(el("currentWeight").value),
    targetWeight: Number(el("targetWeight").value),
  };

  const estimated = estimateGoals(profileInput);
  el("goalCalories").value = estimated.goalCalories;
  el("goalProtein").value = estimated.goalProtein;
  el("goalCarbs").value = estimated.goalCarbs;
  el("goalFat").value = estimated.goalFat;
  el("goalWater").value = estimated.goalWater;

  state.profile = { ...state.profile, ...profileInput, ...estimated };
  saveState();
  renderProfile();
  renderSummary(el("summaryDate").value);
  renderWater();
  renderPlanner();
}

function bindEvents() {
  el("autoGoalBtn").addEventListener("click", applyAutomaticGoals);

  el("profileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.profile = {
      ...state.profile,
      goalType: el("goalType").value,
      activityLevel: el("activityLevel").value,
      age: Number(el("age").value),
      height: Number(el("height").value),
      currentWeight: Number(el("currentWeight").value),
      targetWeight: Number(el("targetWeight").value),
      goalCalories: Number(el("goalCalories").value),
      goalProtein: Number(el("goalProtein").value),
      goalCarbs: Number(el("goalCarbs").value),
      goalFat: Number(el("goalFat").value),
      goalWater: Number(el("goalWater").value),
    };
    saveState();
    renderProfile();
    renderSummary(el("summaryDate").value);
    renderWater();
  });

  el("foodForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.foods.push({
      id: crypto.randomUUID(),
      name: el("foodName").value.trim(),
      serving: Number(el("foodServing").value),
      calories: Number(el("foodCalories").value),
      protein: Number(el("foodProtein").value),
      carbs: Number(el("foodCarbs").value),
      fat: Number(el("foodFat").value),
    });
    event.target.reset();
    saveState();
    renderFoods();
    renderPlanner();
  });

  el("foodList").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-food-id]");
    if (!button) return;
    state.foods = state.foods.filter((item) => item.id !== button.dataset.foodId);
    saveState();
    renderFoods();
    renderMeals();
    renderPlanner();
    renderSummary(el("summaryDate").value);
  });

  el("mealForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.meals.push({
      id: crypto.randomUUID(),
      date: el("mealDate").value,
      type: el("mealType").value,
      foodId: el("mealFood").value,
      grams: Number(el("mealGrams").value),
      createdAt: new Date().toISOString(),
    });
    saveState();
    renderMeals();
    renderSummary(el("summaryDate").value);
    renderPlanner();
  });

  el("mealList").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-meal-id]");
    if (!button) return;
    state.meals = state.meals.filter((meal) => meal.id !== button.dataset.mealId);
    saveState();
    renderMeals();
    renderSummary(el("summaryDate").value);
    renderPlanner();
  });

  document.querySelectorAll("button[data-water]").forEach((button) => {
    button.addEventListener("click", () => {
      const amount = Number(button.dataset.water);
      state.waterByDate[today] = (state.waterByDate[today] ?? 0) + amount;
      saveState();
      renderWater();
      renderWaterHistory();
      renderSummary(el("summaryDate").value);
    });
  });

  el("resetWater").addEventListener("click", () => {
    state.waterByDate[today] = 0;
    saveState();
    renderWater();
    renderWaterHistory();
    renderSummary(el("summaryDate").value);
  });

  el("progressForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.progress.push({
      id: crypto.randomUUID(),
      date: el("progressDate").value,
      weight: Number(el("progressWeight").value),
      waist: Number(el("measureWaist").value),
      hip: Number(el("measureHip").value),
      arm: Number(el("measureArm").value),
    });
    saveState();
    renderProgress();
    event.target.reset();
  });

  el("progressList").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-progress-id]");
    if (!button) return;
    state.progress = state.progress.filter((item) => item.id !== button.dataset.progressId);
    saveState();
    renderProgress();
  });

  el("summaryDate").addEventListener("change", (event) => {
    renderSummary(event.target.value);
  });

  ["plannerDate", "plannerFood", "plannerMacro"].forEach((id) => {
    el(id).addEventListener("change", renderPlanner);
  });

  el("openFoodForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = el("offQuery").value.trim();
    if (!query) return;

    const node = el("offResults");
    node.innerHTML = "<li><span>Buscando...</span></li>";

    try {
      const results = await searchOpenFoodFacts(query);
      renderOpenFoodResults(results);
    } catch {
      node.innerHTML = "<li><span>Não foi possível consultar a API agora.</span></li>";
    }
  });

  el("offResults").addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-off]");
    if (!btn) return;

    const food = JSON.parse(btn.dataset.off);
    el("foodName").value = food.name;
    el("foodServing").value = food.serving || 100;
    el("foodCalories").value = food.calories || 0;
    el("foodProtein").value = food.protein || 0;
    el("foodCarbs").value = food.carbs || 0;
    el("foodFat").value = food.fat || 0;
  });
}

function init() {
  ["mealDate", "summaryDate", "plannerDate", "progressDate"].forEach((id) => {
    el(id).value = today;
  });

  bindEvents();
  renderProfile();
  renderFoods();
  renderMeals();
  renderWater();
  renderWaterHistory();
  renderProgress();
  renderSummary(today);
  renderPlanner();
}

init();
