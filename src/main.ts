/*
import { invoke } from "@tauri-apps/api/tauri";

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    greetMsgEl.textContent = await invoke("greet", {
      name: greetInputEl.value,
    });
  }
}
  */

import {
  BaseDirectory,
  exists,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/api/fs";

const HISTORYPATH = "history.txt";
const HISTORY: string[] = [];

window.addEventListener("DOMContentLoaded", () => {
  const $input = document.getElementById(
    "calculator-input"
  ) as HTMLInputElement | null;
  const $result = document.getElementById("calculator-result");
  let resultText: string;

  getHistory();

  $input?.addEventListener("input", (e) => {
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
  });

  window.addEventListener("keydown", (e) => {
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
  });
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
  try {
    const existsHistory = await exists(HISTORYPATH);

    if (HISTORY.length !== 0) {
      HISTORY.length = 0;
    }
    alert(existsHistory);
    if (existsHistory) {
      const historyContent = await readTextFile(HISTORYPATH, {
        dir: BaseDirectory.App,
      });
      const content = historyContent.split("\n");
      content.map((c) => HISTORY.push(c));
    } else {
      await writeTextFile(HISTORYPATH, "", { dir: BaseDirectory.App });
    }
  } catch (error) {
    console.error(error);
  }
}

async function writeHistoryFile(content: string) {
  try {
    await writeTextFile(HISTORYPATH, `${content}\n`, {
      dir: BaseDirectory.App,
      append: true,
    });
  } catch (error) {
    console.error(error);
  }
}
