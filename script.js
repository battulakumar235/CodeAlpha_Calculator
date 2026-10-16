const display = document.querySelector("#display");
const historyLine = document.querySelector("#history");
const message = document.querySelector("#message");
const keypad = document.querySelector("#keypad");
let justEvaluated = false;

function showMessage(text, error = false) {
  message.textContent = text;
  message.style.color = error ? "#ff8caa" : "";
}
function append(value) {
  if (justEvaluated && /[0-9.]/.test(value)) display.value = "0";
  justEvaluated = false;
  if (display.value === "0" && /[0-9]/.test(value)) display.value = value;
  else display.value += value;
  showMessage("Tip: use your keyboard, too.");
}
function clearAll() {
  display.value = "0";
  historyLine.textContent = "Ready for your calculation";
  justEvaluated = false;
  showMessage("Cleared.");
}
function safeCalculate(raw) {
  let expression = raw.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/%/g, "/100");
  if (!expression.trim() || !/^[0-9+\-*/().\s]+$/.test(expression)) throw new Error("Enter a valid arithmetic expression.");
  // Evaluate only a strictly validated arithmetic expression (no identifiers or function calls).
  const result = Function('"use strict"; return (' + expression + ')')();
  if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("Cannot divide by zero or calculate this value.");
  return Number.parseFloat(result.toPrecision(12)).toString();
}
function calculate() {
  try {
    const original = display.value;
    const result = safeCalculate(original);
    historyLine.textContent = original + " =";
    display.value = result;
    justEvaluated = true;
    showMessage("Calculation complete.");
  } catch (error) {
    showMessage(error.message || "Invalid calculation.", true);
  }
}
function perform(action) {
  if (action === "clear") return clearAll();
  if (action === "delete") { display.value = display.value.length > 1 ? display.value.slice(0, -1) : "0"; justEvaluated = false; return; }
  if (action === "equals") return calculate();
  if (action === "sign") {
    try { display.value = String(-Number(safeCalculate(display.value))); justEvaluated = true; }
    catch { showMessage("Enter a number before changing its sign.", true); }
  }
}
keypad.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action) perform(button.dataset.action);
  else if (button.dataset.value) append(button.dataset.value);
});
display.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === "=") { event.preventDefault(); calculate(); }
  if (event.key === "Escape") clearAll();
});
document.addEventListener("keydown", event => {
  if (document.activeElement === display) return;
  if (/^[0-9.+\-*/()%]$/.test(event.key)) append(event.key);
  else if (event.key === "Enter" || event.key === "=") calculate();
  else if (event.key === "Backspace") perform("delete");
  else if (event.key === "Escape") clearAll();
});
document.querySelector("#themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("alternate");
  showMessage("Accent theme changed.");
});