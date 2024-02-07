import * as ErrorHandler from "./errorHandler.js";
import { extLine } from "./errorHandler.js";
export function dinamicGridAdjust(gridDivs) {
  if (
    gridDivs?.length > 0 &&
    gridDivs.every((div) => div instanceof HTMLElement)
  ) {
    gridDivs.forEach((gridDiv) => {
      if (gridDiv instanceof HTMLElement) {
        switch (getComputedStyle(gridDiv).display) {
          case "grid":
            const nColumns = (
              gridDiv.style.gridTemplateColumns ||
              getComputedStyle(gridDiv).gridTemplateColumns
            )
              .trim()
              .split(/\s+/g).length;
            !isNaN(nColumns) && nColumns > 0
              ? (gridDiv.style.width = (25 * (nColumns + 1)).toFixed(1) + "vw")
              : console.warn(
                  `nColumns returned as NaN or not a natural number. Value obtained: ${nColumns}`
                );
            break;
          case "flex":
            switch (gridDiv.style.flexDirection) {
              case "row":
                gridDiv.style.width = "60%";
                break;
              case "row-reverse":
                gridDiv.style.width = "60%";
                break;
              case "column":
                gridDiv.style.width = "90%";
                break;
              case "column-reverse":
                gridDiv.style.width = "90%";
                break;
              default:
                gridDiv.style.width = "70%";
            }
            break;
          default:
            gridDiv.style.width = "70%";
        }
      } else
        ErrorHandler.elementNotFound(
          gridDiv,
          `gridDiv id ${gridDiv?.id ?? "UNIDENTIFIED"}`,
          extLine(new Error())
        );
    });
  } else
    ErrorHandler.elementNotPopulated(
      gridDivs,
      "gridDivs in dinamicGridAjust()",
      extLine(new Error())
    );
}
export function showTips() {
  const tipBtns = Array.from(document.getElementsByClassName("tipBtn"));
  if (tipBtns?.length > 0) {
    tipBtns.forEach((tipBtn) => {
      tipBtn instanceof HTMLButtonElement
        ? tipBtn.addEventListener("click", () => showInHidTip(tipBtn))
        : ErrorHandler.elementNotFound(
            tipBtn,
            "Tip Button",
            extLine(new Error())
          );
      document.addEventListener("click", (click) => {
        const dlgInBtn =
          tipBtn?.querySelector("dialog") || tipBtn.nextElementSibling;
        if (dlgInBtn instanceof HTMLElement) {
          // const clickArea = isClickOutside(click, dlgInBtn);
          // if (
          //   (dlgInBtn.hidden = false && clickArea.some(bool => bool === true))
          // )
          //   dlgInBtn.hidden = true;
        }
      });
    });
  } else
    ErrorHandler.elementNotPopulated(tipBtns, "tipBtns", extLine(new Error()));
  return tipBtns;
}
export function showInHidTip(tipBtn) {
  const dlgInBtn = tipBtn?.querySelector("dialog") || tipBtn.nextElementSibling;
  if (dlgInBtn instanceof HTMLDialogElement) {
    dlgInBtn.show();
    setTimeout(() => {
      dlgInBtn.close();
    }, 10000);
  }
  if (
    dlgInBtn?.classList.contains("tipDlg") &&
    (dlgInBtn instanceof HTMLDialogElement ||
      dlgInBtn instanceof HTMLDivElement ||
      dlgInBtn instanceof HTMLSpanElement)
  ) {
    dlgInBtn.hidden = !dlgInBtn.hidden;
    setTimeout(() => {
      if (dlgInBtn.hidden === false) dlgInBtn.hidden = true;
    }, 5000);
  } else
    ErrorHandler.elementNotFound(
      dlgInBtn,
      `Dialog related to ${tipBtn?.id || "UNDEFINED ID TIP BUTTON"}`,
      extLine(new Error())
    );
  return dlgInBtn;
}
export function isClickOutside(event, dlgInBtn) {
  const rect = dlgInBtn.getBoundingClientRect();
  const { clientX, clientY } = event;
  return [
    clientX < rect.left,
    clientX > rect.right,
    clientY < rect.top,
    clientY > rect.bottom,
  ];
}
export function fadeElement(el, opacity = "1") {
  if (el instanceof HTMLElement) {
    el.style.opacity = opacity;
    setTimeout(() => {
      el.style.transition = "opacity 0.5s ease-in";
    }, 500);
  } else
    ErrorHandler.elementNotFound(
      el,
      `element ${el?.id ?? "UNDEFINED ELEMENT"}`,
      extLine(new Error())
    );
}
export function highlightChange(el, color = "red", context = "both") {
  if (el instanceof HTMLElement && typeof color === "string") {
    const iniColor = el.style.borderColor || "rgba(128, 128, 128, 0.3)";
    const iniFontColor = el.style.color || "black";
    const pulseBColor = (el) => {
      setTimeout(() => {
        el.style.borderColor = color;
        setTimeout(() => {
          el.style.transition = "border-color 0.5s ease-in";
          setTimeout(() => {
            el.style.borderColor = iniColor;
            setTimeout(() => {
              el.style.transition = "border-color 0.5s ease-in";
            }, 500);
          }, 250);
        }, 500);
      }, 250);
    };
    const pulseFColor = (el) => {
      setTimeout(() => {
        el.style.color = color;
        setTimeout(() => {
          el.style.transition = "color 0.5s ease-in";
          setTimeout(() => {
            el.style.color = iniFontColor;
            setTimeout(() => {
              el.style.transition = "color 0.5s ease-in";
            }, 500);
          }, 250);
        }, 500);
      }, 250);
    };
    if (context === "both" || context === "border") {
      pulseBColor(el);
      setTimeout(() => {
        pulseBColor(el);
      }, 1600);
    }
    if (context === "both" || context === "font") {
      // if (el )
      pulseFColor(el);
      setTimeout(() => {
        pulseFColor(el);
      }, 1600);
    }
  } else
    ErrorHandler.multipleElementsNotFound(
      extLine(new Error()),
      "arguments for highlightChange()",
      el,
      color
    );
}
