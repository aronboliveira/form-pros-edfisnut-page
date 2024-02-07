import * as GlobalModel from "./gModel.js";
import * as GlobalHandler from "./gHandlers.js";
import * as ErrorHandler from "./errorHandler.js";
import { extLine } from "./errorHandler.js";
import * as XLSX from "./xlsx.mjs";
export function getGlobalEls(
  isAutocorrectOn = true,
  firstClick = true,
  context = "notNum"
) {
  const textConts = [
    ...document.querySelectorAll("textarea"),
    ...document.querySelectorAll('input[type="text"]'),
  ];
  const radioInps = Array.from(
    document.querySelectorAll('input[type="radio"]')
  );
  const dateBtns = Array.from(
    document.querySelectorAll('button[id$="DatBtn"]')
  );
  const deactAutocorrectBtns = [
    ...document.querySelectorAll('button[id^="deactAutocorrectBtn"]'),
    ...document.querySelectorAll('input[id^="deactAutocorrectBtn"]'),
  ];
  const astDigtBtns = Array.from(
    document.querySelectorAll('button[id$="AstDigtBtn')
  );
  const editableCite = document.querySelector('cite[contenteditable="true"]');
  const resetFormBtn = document.getElementById("resetFormBtn");
  const subButton = document.getElementById("submitFormButId");
  textConts?.length > 0
    ? addListenerTexts(textConts, isAutocorrectOn)
    : ErrorHandler.elementNotPopulated(
        textConts,
        "textConts",
        extLine(new Error())
      );
  radioInps?.length > 0
    ? addListenerRadios(radioInps, "ed")
    : ErrorHandler.elementNotPopulated(
        radioInps,
        "radioInps",
        extLine(new Error())
      );
  dateBtns?.length > 0
    ? addListenerDateBtns(dateBtns)
    : ErrorHandler.elementNotPopulated(
        dateBtns,
        "dateBtns",
        extLine(new Error())
      );
  astDigtBtns?.length > 0
    ? addListenerAstDigitBtns(astDigtBtns)
    : ErrorHandler.elementNotPopulated(
        astDigtBtns,
        "astDigtBtns",
        extLine(new Error())
      );
  subButton instanceof HTMLButtonElement
    ? subButton.addEventListener("click", () =>
        GlobalHandler.subForm(subButton)
      )
    : ErrorHandler.elementNotFound(
        subButton,
        "subButton",
        extLine(new Error())
      );
  resetFormBtn instanceof HTMLButtonElement
    ? resetFormBtn.addEventListener("click", (click) =>
        GlobalHandler.resetarFormulario(click, astDigtBtns, resetFormBtn)
      )
    : ErrorHandler.elementNotFound(
        resetFormBtn,
        "resetFormBtn",
        extLine(new Error())
      );
  if (context === "num") {
    const numInps = Array.from(
      document.querySelectorAll('input[type="number"]')
    );
    numInps?.length > 0
      ? addListenerNumInps(numInps)
      : ErrorHandler.elementNotPopulated(
          numInps,
          "numInps",
          extLine(new Error())
        );
  }
  deactAutocorrectBtns?.length > 0
    ? (isAutocorrectOn = addListenerAutocorrectBtns(
        deactAutocorrectBtns,
        isAutocorrectOn
      ))
    : ErrorHandler.elementNotPopulated(
        deactAutocorrectBtns,
        "deactAutoCorrectBtns",
        extLine(new Error())
      );
  firstClick = addListenerCite(editableCite, isAutocorrectOn, firstClick);
  return [isAutocorrectOn || true, firstClick || false];
}
export function addListenerTexts(textConts, isAutocorrectOn = true) {
  if (textConts.every((el) => el instanceof HTMLElement)) {
    textConts.forEach((textCont) => {
      if (textCont?.classList.contains("autocorrect")) {
        textCont instanceof HTMLTextAreaElement ||
        (textCont instanceof HTMLInputElement && textCont.type === "text")
          ? textCont.addEventListener("input", () => {
              isAutocorrectOn = GlobalModel.checkAutoCorrect(
                document.querySelector('button[id^="deactAutocorrectBtn"]') ||
                  document.querySelector('input[id^="deactAutocorrectBtn"]')
              );
              GlobalModel.autoCapitalizeInputs(textCont, isAutocorrectOn);
            })
          : ErrorHandler.inputNotFound(
              textCont,
              `target textCont id ${JSON.stringify(
                textCont?.id || "UNIDENTIFIED TEXTCONT"
              )}`,
              extLine(new Error())
            );
      }
    });
  } else console.error(`Erro validando instâncias em textConts`);
}
export function addListenerNumInps(numInps) {
  if (numInps.every((el) => el instanceof HTMLElement)) {
    numInps.forEach((numInp) => {
      numInp instanceof HTMLInputElement && numInp.type === "number"
        ? numInp.addEventListener("input", () => {
            GlobalModel.numberLimit(numInp);
          })
        : ErrorHandler.inputNotFound(
            numInp,
            `target numInp id ${JSON.stringify(
              numInp?.id || "UNIDENTIFIED TEXTCONT"
            )}`,
            extLine(new Error())
          );
    });
  } else console.error(`Erro validando instâncias em numInps`);
}
export function addListenerRadios(radioInps, context = "od") {
  if (
    radioInps.every((el) => el instanceof HTMLElement) &&
    (context === "od" || context === "ed" || context === "ag")
  ) {
    radioInps.forEach((radio) => {
      if (radio instanceof HTMLInputElement && radio.type === "radio") {
        radio.addEventListener("keydown", (keydown) => {
          GlobalHandler.opRadioHandler(
            keydown,
            Array.from(
              document.querySelectorAll(
                'input[id$="Yes"], input[id$="No"]' //acessando como par
              )
            )
          );
        });
        radio.addEventListener("dblclick", () =>
          GlobalHandler.doubleClickHandler(radio)
        );
        if (context === "ed" || context === "ag") {
          radio.addEventListener("change", (change) =>
            GlobalHandler.cpbInpHandler(change, radio)
          );
          radio.addEventListener("keydown", (keydown) =>
            GlobalHandler.cpbInpHandler(keydown, radio)
          );
          context === "ag" &&
            radio.addEventListener("change", () =>
              GlobalHandler.deactTextInput(
                document.querySelectorAll('input[type="number"][id$=NumId]'),
                document.querySelectorAll("input[id$=NullId]")
              )
            );
        }
        // radio.addEventListener("touchstart", GlobalHandler.touchStartHandler);
      } else
        ErrorHandler.inputNotFound(
          radio,
          `target radio id ${radio?.id || "UNDEFINED ID RADIO"}`,
          extLine(new Error())
        );
    });
  } else console.error(`Erro validando instâncias em radioInps`);
}
export function addListenerDateBtns(dateBtns) {
  if (dateBtns.every((el) => el instanceof HTMLElement)) {
    dateBtns.forEach((dateBtn) => {
      dateBtn instanceof HTMLButtonElement
        ? dateBtn.addEventListener("click", (activation) => {
            GlobalHandler.useCurrentDate(activation, dateBtn);
          })
        : ErrorHandler.elementNotFound(
            dateBtn,
            `target dateBtn id ${dateBtn?.id || "UNDEFINED ID DATEBTN"}`,
            extLine(new Error())
          );
    });
  } else console.error(`Erro validando instâncias em dateBtns`);
}
export function addListenersGenConts(genElement, genValue = "masculino") {
  const genBirthRel = document.getElementById("genBirthRelId");
  const genTrans = document.getElementById("genTransId");
  const genFisAlin = document.getElementById("genFisAlinId");
  if (
    GlobalModel.checkAllGenConts(
      genElement,
      genBirthRel,
      genTrans,
      genFisAlin
    ) &&
    typeof genValue === "string"
  ) {
    const arrGenConts = [genElement, genBirthRel, genTrans, genFisAlin];
    arrGenConts.forEach((genCont) => {
      genCont.addEventListener("change", () => {
        genValue =
          GlobalModel.fluxGen(arrGenConts, genElement?.value) || "masculino";
        return genValue || "masculino";
      });
    });
  } else
    ErrorHandler.multipleElementsNotFound(
      extLine(new Error()),
      "gen Elements",
      genElement,
      genBirthRel,
      genTrans,
      genFisAlin
    );
  return genValue || "masculino";
}
export function addListenerCite(
  editableCite,
  isAutocorrectOn = true,
  firstClick = true
) {
  if (editableCite instanceof HTMLElement) {
    const citeClickHandler = (click) => {
      if (firstClick && click.target instanceof HTMLElement) {
        GlobalModel.removeFirstClick(click.target);
        firstClick = false;
        editableCite.removeEventListener("click", citeClickHandler);
      }
    };
    editableCite.addEventListener("keyup", (keypress) => {
      keypress.target instanceof HTMLElement
        ? GlobalModel.autoCapitalizeCite(keypress.target, isAutocorrectOn)
        : ErrorHandler.elementNotFound(
            keypress.target,
            "keypress with editableCite as a target",
            extLine(new Error())
          );
    });
    editableCite.addEventListener("click", citeClickHandler);
  } else
    ErrorHandler.elementNotFound(null, "editableCite", extLine(new Error()));
  return firstClick || false;
}
export function addListenerAutocorrectBtns(
  deactAutocorrectBtns,
  isAutocorrectOn = true
) {
  if (deactAutocorrectBtns.every((el) => el instanceof HTMLElement)) {
    deactAutocorrectBtns.forEach((deactAutocorrectBtn) => {
      deactAutocorrectBtn instanceof HTMLButtonElement ||
      (deactAutocorrectBtn instanceof HTMLInputElement &&
        (deactAutocorrectBtn.type === "checkbox" ||
          deactAutocorrectBtn.type === "radio"))
        ? deactAutocorrectBtn.addEventListener("click", (click) => {
            isAutocorrectOn = GlobalModel.switchAutocorrect(
              click,
              deactAutocorrectBtn,
              isAutocorrectOn
            );
            return isAutocorrectOn;
          })
        : ErrorHandler.elementNotPopulated(
            deactAutocorrectBtns,
            `target deactAutocorrectBtn id ${
              deactAutocorrectBtn?.id || "UNDEFINED ID BUTTON"
            }`,
            extLine(new Error())
          );
    });
  } else console.error(`Erro validando instâncias em deactAutocorrectBtns`);
  return isAutocorrectOn || true;
}
export function addListenerAstDigitBtns(astDigtBtns) {
  if (astDigtBtns.every((el) => el instanceof HTMLElement)) {
    astDigtBtns.forEach((astDigtBtn) => {
      astDigtBtn instanceof HTMLButtonElement
        ? astDigtBtn.addEventListener("click", (click) => {
            GlobalHandler.changeToAstDigit(click, astDigtBtn);
          })
        : ErrorHandler.elementNotFound(
            astDigtBtn,
            astDigtBtn?.id || "UNDEFINED ID BUTTON",
            extLine(new Error())
          );
    });
  } else console.error(`Erro validando instâncias em astDigtBtns`);
}
export function addListenerExportBtn(context = "undefined") {
  const btnExport = document.getElementById("btnExport");
  if (
    btnExport instanceof HTMLButtonElement ||
    (btnExport instanceof HTMLInputElement &&
      (btnExport.type === "radio" || btnExport.type === "checkbox"))
  ) {
    btnExport.addEventListener("click", async () => {
      try {
        const allEntryEls = [
          ...document.querySelectorAll("input"),
          ...document.querySelectorAll("textarea"),
          ...document.querySelectorAll("select"),
        ];
        const arrValues = [];
        const arrTitles = [];
        for (const el of allEntryEls) {
          if (
            el instanceof HTMLInputElement &&
            (el.type === "checkbox" || el.type === "radio")
          ) {
            el.checked ? arrValues.push("sim") : arrValues.push("nao");
          } else arrValues.push(el.value || "nulo");
          arrTitles.push(el.dataset?.title || "sem_titulo");
        }
        const editableCite = document.getElementById("citeNameId");
        arrValues.push(editableCite?.textContent || "nulo");
        arrTitles.push(editableCite?.dataset?.title || "sem_titulo");
        while (arrValues.length > arrTitles.length)
          arrTitles.push("sem_titulo");
        while (arrTitles.length > arrValues.length) arrValues.push("nulo");
        if (arrValues.length === arrTitles.length) {
          const wb = XLSX.utils.book_new();
          const dataJSON = arrValues.map((val, i) => ({
            c1: arrTitles[i],
            c2: val,
          }));
          XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.json_to_sheet(dataJSON, undefined),
            "Sheet1",
            undefined
          );
          XLSX.writeFile(wb, `data_${context}form.xlsx`, undefined);
          console.log("Spreadsheet generated.");
        } else throw new Error(`Error validating length of data arrays`);
      } catch (error) {
        console.error("Error generating spreadsheet:", error);
      }
    });
  } else
    ErrorHandler.elementNotFound(
      btnExport,
      "argument for addListenerExportBtn()",
      extLine(new Error())
    );
  return btnExport;
}
