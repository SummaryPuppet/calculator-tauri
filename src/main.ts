import { invoke } from "@tauri-apps/api/tauri";

const HISTORY: string[] = [];

window.addEventListener("DOMContentLoaded", () => {
  const $input = document.getElementById(
    "calculator-input"
  ) as HTMLInputElement | null;
  const $result = document.getElementById("calculator-result");

  let resultText: string;

  getHistory().then(() => renderHistory());

  $input?.addEventListener("input", inputEvent);
  window.addEventListener("keydown", keydownEvent);

  function inputEvent(e: Event) {
    const target = e?.target as HTMLInputElement;
    const value = target.value;

    let computedValue;

    try {
      computedValue = eval(value);
      if (isNaN(computedValue) || typeof computedValue !== "number") {
        computedValue = "Invalid operation";
      }
    } catch (e) {
      if (e === ReferenceError) {
        computedValue = "Invalid operation";
      }
    }

    if (value.length === 0) {
      computedValue = "";
    }

    resultText =
      computedValue === "Invalid operation" ||
      computedValue === "" ||
      computedValue == value ||
      computedValue === undefined
        ? computedValue
        : `${value} = ${computedValue}`;

    $result!.textContent = resultText;
  }

  function keydownEvent(e: KeyboardEvent) {
    if (e.key === "Enter") {
      if (resultText) {
        HISTORY.push(resultText);
        writeHistoryFile(resultText);

        $input!.value = "";
        $result!.textContent = "";
        resultText = "";

        renderHistory();
      }
    } else if (e.key.length === 1) {
      $input?.focus();

      e.preventDefault();

      $input!.value += e.key;

      $input!.dispatchEvent(new Event("input"));
    }
  }
});

function renderHistory() {
  const $historyContainer = document.getElementById("history");

  $historyContainer!.innerHTML = "";

  HISTORY.map((expression) => {
    const $li = document.createElement("li");
    $li.textContent = expression;

    $historyContainer?.appendChild($li);
  });
}

async function getHistory() {
  const content: string = await invoke("get_history_content");

  if (!content) return;

  HISTORY.length = 0;

  const c = content.split("\n");

  c.map((content) => HISTORY.push(content));
}

async function writeHistoryFile(content: string) {
  await invoke("write_history", { content: `${content}\n` });
}
