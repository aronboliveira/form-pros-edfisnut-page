//nesse file estão presentes principalmente as funções de manipulação dinâmica de texto e layout
import * as EdFisNutModel from "./edFisNutModel.js";
import * as GlobalModel from "./gModel.js";
import * as GlobalHandler from "./gHandlers.js";
import * as GlobalStyle from "./gStyleScript.js";
import * as ErrorHandler from "./errorHandler.js";
import { extLine } from "./errorHandler.js";
var EnumTargInpTypes;
(function (EnumTargInpTypes) {
    EnumTargInpTypes[EnumTargInpTypes["weight"] = 0] = "weight";
    EnumTargInpTypes[EnumTargInpTypes["height"] = 1] = "height";
    EnumTargInpTypes[EnumTargInpTypes["IMC"] = 2] = "IMC";
    EnumTargInpTypes[EnumTargInpTypes["MLG"] = 3] = "MLG";
    EnumTargInpTypes[EnumTargInpTypes["TMB"] = 4] = "TMB";
    EnumTargInpTypes[EnumTargInpTypes["GET"] = 5] = "GET";
})(EnumTargInpTypes || (EnumTargInpTypes = {}));
const enumTargInpTypes = EnumTargInpTypes;
export function switchAutoFill(autoFillBtn, isAutoFillActive = true) {
    const locksTabInd = Array.from(document.getElementsByClassName("lockTabInd"));
    if ((autoFillBtn instanceof HTMLButtonElement ||
        (autoFillBtn instanceof HTMLInputElement &&
            (autoFillBtn.type === "checkbox" || autoFillBtn.type === "radio"))) &&
        typeof isAutoFillActive === "boolean") {
        if (autoFillBtn instanceof HTMLInputElement &&
            (/Cálculo Automático/gi.test(autoFillBtn.innerText) ||
                (autoFillBtn.nextElementSibling instanceof HTMLElement &&
                    /Cálculo Automático/gi.test(autoFillBtn.nextElementSibling.innerText)) ||
                (autoFillBtn.previousElementSibling instanceof HTMLElement &&
                    /Cálculo Automático/gi.test(autoFillBtn.previousElementSibling.innerText))))
            isAutoFillActive = !isAutoFillActive;
        else {
            if (autoFillBtn.innerText.match(/Desativar Cálculo Automático/gi)) {
                isAutoFillActive = false;
                autoFillBtn.textContent = "Ativar Cálculo Automático";
            }
            else if (autoFillBtn.innerText.match(/Ativar Cálculo Automático/gi))
                autoFillBtn.textContent = "Desativar Cálculo Automático";
            else
                ErrorHandler.stringError(".innerText of autoFillBtn", autoFillBtn?.innerText ?? "UNDEFINED INNER TEXT", extLine(new Error()));
        }
        locksTabInd?.length > 0 &&
            locksTabInd.every(lockTabInd => lockTabInd instanceof HTMLElement)
            ? switchLockInputs(locksTabInd, isAutoFillActive)
            : ErrorHandler.elementNotPopulated(locksTabInd, "locksTabInd", extLine(new Error()));
    }
    else
        ErrorHandler.elementNotFound(autoFillBtn, "autoFillBtn", extLine(new Error()));
    return isAutoFillActive;
}
export function switchLockInputs(locksTabInd, autoFillActivation = false) {
    if (locksTabInd?.length > 0 &&
        locksTabInd.every(lock => lock instanceof HTMLElement) &&
        typeof autoFillActivation === "boolean") {
        //valida o input e realiza a modificação do svg
        locksTabInd.forEach(lock => {
            const siblingInput = lock?.parentElement?.parentElement?.querySelector(".tabInpProg");
            if (siblingInput instanceof HTMLInputElement ||
                siblingInput instanceof HTMLSelectElement ||
                (siblingInput instanceof HTMLTextAreaElement &&
                    lock instanceof HTMLSpanElement)) {
                if (autoFillActivation) {
                    GlobalStyle.fadeElement(lock, "0");
                    setTimeout(() => {
                        lock.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lock" viewBox="0 0 16 16">
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2M5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1"/>
            </svg>`;
                        GlobalStyle.fadeElement(lock, "1");
                    }, 500);
                }
                else {
                    GlobalStyle.fadeElement(lock, "0");
                    setTimeout(() => {
                        lock.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-unlock" viewBox="0 0 16 16">
          <path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2M3 8a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1z"/>
        </svg>`;
                        GlobalStyle.fadeElement(lock, "1");
                    }, 500);
                }
            }
            else {
                ErrorHandler.inputNotFound(siblingInput, "siblingInput", extLine(new Error()));
            }
        });
    }
    else
        console.error(`Error validating locks for index table.
    Obtained .length: ${locksTabInd?.length ?? 0};
    Are all elements instances of HTMLSpanElement: ${locksTabInd.every(lock => lock instanceof HTMLSpanElement) ?? false}
    typeof autoFillActivation: ${typeof autoFillActivation}`);
}
export function getNumCol(evEl) {
    let numCol = 2;
    console.log("EVEL ID " + evEl?.id);
    (evEl && evEl.id?.match(/[0-9]+_[0-9]+$/g)) ||
        (evEl instanceof HTMLInputElement && evEl.name?.match(/[0-9]+_[0-9]+$/g)) ||
        (evEl instanceof HTMLLabelElement && evEl.htmlFor?.match(/[0-9]+_[0-9]+$/g))
        ? (numCol = GlobalModel.parseNotNaN(evEl.id.slice(-1)))
        : ErrorHandler.matchError(".id do Elemento de Evento", evEl, evEl?.id ?? "null", extLine(new Error()));
    return numCol || 2;
}
export function validateEvResultNum(evEl, property = 0) {
    if (((evEl instanceof HTMLInputElement &&
        (evEl.type === "number" || evEl.type === "text")) ||
        evEl instanceof HTMLSelectElement ||
        evEl instanceof HTMLTextAreaElement) &&
        (typeof property === "number" || typeof property === "string")) {
        const returnedProperty = GlobalHandler.updateSimpleProperty(evEl) || 0;
        if (typeof returnedProperty === "number")
            property = returnedProperty;
        else if (typeof returnedProperty === "string")
            property = GlobalModel.parseNotNaN(returnedProperty.replaceAll(/[^0-9.,+-]/g, ""));
        else {
            ErrorHandler.typeError(`property for ${evEl?.id ?? "undefined Event Element"}`, property, "number", extLine(new Error()));
            property = 0;
        }
    }
    else {
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for validateEvResultNum", evEl, property);
        property = 0;
    }
    return property || 0;
}
export function matchPersonPropertiesWH(person, targInpWeight, targInpHeight) {
    if (person && Object.keys(person)?.length > 0) {
        if ("weight" in person &&
            typeof person.weight !== "number" &&
            typeof person.weight !== "string") {
            console.warn(`Type obtained for person.weight invalid. Value defaulted.`);
            person.weight = 0;
        }
        if ("height" in person &&
            typeof person.height !== "number" &&
            typeof person.height !== "string") {
            console.warn(`Type obtained for person.height invalid. Value defaulted.`);
            person.height = 0;
        }
        targInpWeight instanceof HTMLInputElement
            ? (person.weight = validateEvResultNum(targInpWeight, person.weight))
            : ErrorHandler.inputNotFound(targInpWeight, "targInpWeight", extLine(new Error()));
        targInpHeight instanceof HTMLInputElement
            ? (person.height = validateEvResultNum(targInpHeight, person.height))
            : ErrorHandler.inputNotFound(targInpHeight, "targInpHeight", extLine(new Error()));
    }
    else
        ErrorHandler.objectError("arguments de matchPersonPropertiesWH", person, "person", 6, extLine(new Error()));
    return [person.weight || 0, person.height || 0];
}
export function matchPersonPropertiesDC(person, targInpSumDCut) {
    if (person && Object.keys(person)?.length > 0) {
        if ("sumDCut" in person &&
            typeof person.sumDCut !== "number" &&
            typeof person.sumDCut !== "string") {
            console.warn(`Type for person.sumDCut invalid. Value defaulted.`);
            person.sumDCut = 0;
        }
        targInpSumDCut instanceof HTMLInputElement
            ? (person.sumDCut = validateEvResultNum(targInpSumDCut, person.sumDCut))
            : ErrorHandler.inputNotFound(targInpSumDCut, "targInpSumDCut", extLine(new Error()));
    }
    else
        ErrorHandler.objectError("arguments for matchPersonPropertiesDC", person, "person", 6, extLine(new Error()));
    return person.sumDCut || 0;
}
export function updateIndexesContexts(person, arrGord, arrMetab, factorAtvLvl = 1.4, factorAtleta = "Peso") {
    let IMC = 0, MLG = 0, TMB = 0, GET = 0;
    // targInpIMC = null,
    // targInpMLG = null,
    if (factorAtleta === "peso")
        factorAtleta = "Peso";
    if (factorAtleta === "mlg")
        factorAtleta = "MLG";
    if (person &&
        arrGord?.length === 3 &&
        arrGord.every(elGord => elGord instanceof HTMLElement) &&
        arrMetab?.length === 3 &&
        arrMetab.every(elMetab => elMetab instanceof HTMLElement) &&
        typeof factorAtvLvl === "number" &&
        (factorAtleta === "Peso" || factorAtleta === "MLG")) {
        // [
        // gordCorpLvl,
        // ,targInpIMC, targInpMLG
        // ] = arrGord;
        const gordCorpLvl = arrGord[0];
        const [targInpTMB, targInpGET, formTMBTypeElement] = arrMetab;
        const IMCMLGArray = person.calcIMC(person) || ["", 0, 0];
        IMC = GlobalModel.parseNotNaN(IMCMLGArray[1].toFixed(4), 0, "float") || 0;
        MLG = GlobalModel.parseNotNaN(IMCMLGArray[2].toFixed(4), 0, "float") || 0;
        updateIMCMLGContext(arrGord, formTMBTypeElement, IMCMLGArray, "NONE");
        TMB =
            updateTMBContext(person, [targInpTMB, formTMBTypeElement], IMCMLGArray ?? [
                gordCorpLvl?.value || 0,
                0,
                0,
            ], factorAtleta) || 0;
        TMB >= 0 && factorAtvLvl >= 0
            ? (GET = updateGETContext(person, targInpGET, TMB, factorAtvLvl))
            : console.warn(`TMB and/or factorAtvLvl not updated or invalid.
          Obtained TMB: ${TMB ?? 0};
          Obtained factorAtvLvl: ${factorAtvLvl ?? 0}`);
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for updateIndexesContexts()", `${JSON.stringify(person)}`, `${JSON.stringify(arrGord)}`, `${JSON.stringify(arrMetab)}`, factorAtvLvl, factorAtleta);
    return [IMC || 0, MLG || 0, TMB || 0, GET || 0];
}
export function updateIMCMLGContext(arrGord, formTMBTypeElement, IMCMLGArray = ["abaixo", 0, 0], ignoredIndex = "NONE") {
    let [gordCorpVal = "abaixo", IMC = 0, MLG = 0] = IMCMLGArray;
    const [gordCorpLvl, targInpIMC, targInpMLG] = arrGord;
    if ((gordCorpLvl instanceof HTMLSelectElement ||
        gordCorpLvl instanceof HTMLInputElement) &&
        (targInpIMC instanceof HTMLInputElement ||
            targInpIMC instanceof HTMLSelectElement) &&
        (targInpMLG instanceof HTMLInputElement ||
            targInpMLG instanceof HTMLSelectElement) &&
        (formTMBTypeElement instanceof HTMLSelectElement ||
            targInpIMC instanceof HTMLSelectElement) &&
        (ignoredIndex === "MLG" ||
            ignoredIndex === "IMC" ||
            ignoredIndex === "BOTH" ||
            ignoredIndex === "NONE")) {
        if (gordCorpVal === "abaixo" ||
            gordCorpVal === "eutrofico" ||
            gordCorpVal === "sobrepeso" ||
            gordCorpVal?.match(/obeso/)) {
            gordCorpLvl.value = gordCorpVal || "";
            fluxFormIMC(gordCorpLvl, formTMBTypeElement, IMC);
        }
        else
            ErrorHandler.typeError("gordCorpVal", gordCorpVal, "string", extLine(new Error()));
        !(ignoredIndex === "IMC" || ignoredIndex === "BOTH")
            ? (targInpIMC.value = IMC.toFixed(4) || "0")
            : ErrorHandler.typeError("IMCMLGArray[1]", IMCMLGArray[1], "number", extLine(new Error()));
        !(ignoredIndex === "MLG" || ignoredIndex === "BOTH")
            ? (targInpMLG.value = MLG.toFixed(4) || "0")
            : ErrorHandler.typeError("IMCMLGArray[2]", IMCMLGArray[2], "number", extLine(new Error()));
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "instances of arguments for updateIMCMLGContext()", gordCorpLvl, targInpIMC, targInpMLG, formTMBTypeElement, ignoredIndex);
}
export function fluxFormIMC(gordCorpLvl, formTMBTypeElement, IMC = 0) {
    if (typeof IMC === "number" &&
        (formTMBTypeElement instanceof HTMLSelectElement ||
            formTMBTypeElement instanceof HTMLInputElement) &&
        formTMBTypeElement.value !== "" &&
        (gordCorpLvl instanceof HTMLSelectElement ||
            gordCorpLvl instanceof HTMLInputElement) &&
        gordCorpLvl.value !== "") {
        if (document.getElementById("nafType")?.value === "muitoIntenso") {
            if (!(formTMBTypeElement.value === "tinsley"))
                GlobalStyle.highlightChange(formTMBTypeElement);
            formTMBTypeElement.value = "tinsley";
        }
        else {
            if (IMC >= 0 && IMC < 25.0) {
                if (!(formTMBTypeElement.value === "harrisBenedict"))
                    GlobalStyle.highlightChange(formTMBTypeElement);
                formTMBTypeElement.value = "harrisBenedict";
                if (IMC < 18.5) {
                    if (!(gordCorpLvl.value === "abaixo"))
                        GlobalStyle.highlightChange(gordCorpLvl);
                    gordCorpLvl.value = "abaixo";
                }
                else {
                    if (!(gordCorpLvl.value === "eutrofico"))
                        GlobalStyle.highlightChange(gordCorpLvl);
                    gordCorpLvl.value = "eutrofico";
                }
            }
            else if (IMC >= 25.0) {
                if (!(formTMBTypeElement.value === "mifflinStJeor"))
                    GlobalStyle.highlightChange(formTMBTypeElement);
                formTMBTypeElement.value = "mifflinStJeor";
                if (IMC < 30) {
                    if (!(gordCorpLvl.value === "sobrepeso"))
                        GlobalStyle.highlightChange(gordCorpLvl);
                    gordCorpLvl.value = "sobrepeso";
                }
                else if (IMC >= 30 && IMC < 35) {
                    if (!(gordCorpLvl.value === "obeso1"))
                        GlobalStyle.highlightChange(gordCorpLvl);
                    gordCorpLvl.value = "obeso1";
                }
                else if (IMC >= 35 && IMC < 40) {
                    if (!(gordCorpLvl.value === "obeso2"))
                        GlobalStyle.highlightChange(gordCorpLvl);
                    gordCorpLvl.value = "obeso2";
                }
                else if (IMC > 40) {
                    if (!(gordCorpLvl.value === "obeso3"))
                        GlobalStyle.highlightChange(gordCorpLvl);
                    gordCorpLvl.value = "obeso3";
                }
            }
            else
                console.error(`Error obtaining IMC value in fluxFormIMC(), line ${extLine(new Error())}.
        Obtained value: ${IMC ?? "NaN"}`);
        }
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments in fluxFormIMC()", IMC, formTMBTypeElement, gordCorpLvl);
}
export function updateTMBContext(person, arrTMB, IMCMLGArray = ["abaixo", 0, 0], factorAtleta = "Peso") {
    let TMB = 0, [targInpTMB, formTMBTypeElement] = arrTMB;
    if (factorAtleta === "peso")
        factorAtleta = "Peso";
    if (factorAtleta === "mlg")
        factorAtleta = "MLG";
    if (person &&
        (targInpTMB instanceof HTMLInputElement ||
            targInpTMB instanceof HTMLSelectElement) &&
        (formTMBTypeElement instanceof HTMLSelectElement ||
            targInpTMB instanceof HTMLSelectElement) &&
        typeof IMCMLGArray[1] === "number" &&
        typeof IMCMLGArray[2] === "number" &&
        (factorAtleta === "Peso" || factorAtleta === "MLG")) {
        [targInpTMB, formTMBTypeElement] = arrTMB;
        const TMBArray = person.calcTMB(person, IMCMLGArray[1] || 0, IMCMLGArray[2] || 0, factorAtleta) ?? ["", 0];
        formTMBTypeElement instanceof HTMLSelectElement
            ? (formTMBTypeElement.value = TMBArray[0])
            : ErrorHandler.elementNotFound(formTMBTypeElement, "formTMBTypeElement", extLine(new Error()));
        TMB = GlobalModel.parseNotNaN(TMBArray[1].toFixed(4), 0, "float");
        targInpTMB.value = TMB.toString();
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for updateTMBContext", `${JSON.stringify(person) || null}`, `${JSON.stringify(arrTMB) || null}`, `${JSON.stringify(IMCMLGArray) || null}`, factorAtleta);
    return TMB || 0;
}
export function updateGETContext(person, targInpGET, TMB = 0, factorAtvLvl = 1.4) {
    const GET = GlobalModel.parseNotNaN(person.calcGET(TMB || 0, factorAtvLvl).toFixed(4), 0, "float") || 0;
    targInpGET instanceof HTMLInputElement ||
        targInpGET instanceof HTMLSelectElement
        ? (targInpGET.value = GET.toFixed(4))
        : ErrorHandler.inputNotFound(targInpGET, "targInpGET em updateGETContext", extLine(new Error()));
    return GET || 0;
}
export function matchTMBElements(mainSelect, gordCorpLvl, formTMBTypeElement, spanFactorAtleta, lockGordCorpLvl, IMC = 0) {
    if ((mainSelect instanceof HTMLSelectElement ||
        mainSelect instanceof HTMLInputElement) &&
        (gordCorpLvl instanceof HTMLSelectElement ||
            gordCorpLvl instanceof HTMLInputElement) &&
        (formTMBTypeElement instanceof HTMLSelectElement ||
            formTMBTypeElement instanceof HTMLInputElement) &&
        spanFactorAtleta instanceof HTMLElement &&
        lockGordCorpLvl instanceof HTMLElement) {
        //update em selects secundários (nível de gordura e fórmula)
        function switchSecSelects(formTMBTypeElement, secSelect) {
            switch (formTMBTypeElement.value) {
                case "harrisBenedict":
                    fluxFormIMC(gordCorpLvl, formTMBTypeElement, IMC);
                    break;
                case "mifflinStJeor":
                    fluxFormIMC(gordCorpLvl, formTMBTypeElement, IMC);
                    break;
                case "tinsley":
                    // secSelect.value = (mainSelect as entryEl).value;
                    break;
                default:
                    ErrorHandler.stringError("argument in the switch for formTMBTypeElement.value", formTMBTypeElement?.value, extLine(new Error()));
            }
        }
        //garante coesão de selects primários (nível e fator)
        if (/LvlAtFis/gi.test(mainSelect.id)) {
            const nafType = document.getElementById("nafType");
            if (nafType instanceof HTMLInputElement ||
                nafType instanceof HTMLSelectElement) {
                switchSecSelects(formTMBTypeElement, nafType);
                // mainSelect.value = nafType.value;
            }
            else
                ErrorHandler.inputNotFound(nafType, "nafType in matchTMBElements()", extLine(new Error()));
        }
        else if (/nafType/gi.test(mainSelect.id)) {
            const LvlAtFis = document.getElementById("selectLvlAtFis");
            if (LvlAtFis instanceof HTMLInputElement ||
                LvlAtFis instanceof HTMLSelectElement) {
                switchSecSelects(formTMBTypeElement, LvlAtFis);
                // mainSelect.value = LvlAtFis.value;
            }
            else
                ErrorHandler.inputNotFound(LvlAtFis, "LvlAtFis in matchTMBElements()", extLine(new Error()));
        }
        else
            ErrorHandler.stringError("testing mainSelect.id in matchTMBElements()", mainSelect?.id, extLine(new Error()));
        if (mainSelect.value === "muitoIntenso") {
            if (!(formTMBTypeElement.value === "tinsley"))
                GlobalStyle.highlightChange(formTMBTypeElement);
            formTMBTypeElement.value = "tinsley";
            spanFactorAtleta.hidden = false;
            GlobalStyle.fadeElement(spanFactorAtleta, "0");
            setTimeout(() => {
                GlobalStyle.fadeElement(spanFactorAtleta, "1");
            }, 500);
        }
        else if (mainSelect.value === "sedentario" ||
            mainSelect.value === "leve" ||
            mainSelect.value === "moderado" ||
            mainSelect.value === "intenso") {
            setTimeout(() => {
                GlobalStyle.fadeElement(spanFactorAtleta, "0");
                setTimeout(() => {
                    spanFactorAtleta.hidden = true;
                }, 500);
            }, 500);
            if (gordCorpLvl.value === "sobrepeso" ||
                gordCorpLvl.value === "obeso1" ||
                gordCorpLvl.value === "obeso2" ||
                gordCorpLvl.value === "obeso3" ||
                (IMC && IMC >= 25))
                formTMBTypeElement.value = "mifflinStJeor";
            else if (gordCorpLvl.value === "abaixo" ||
                gordCorpLvl.value === "eutrofico" ||
                (IMC && IMC < 25))
                formTMBTypeElement.value = "harrisBenedict";
            else
                console.error(`Error obtaining the value for Gordura Corporal, line ${extLine(new Error())}.
          Obtained level of Gordura Corporal: ${gordCorpLvl?.value};
          Obtained IMC: ${IMC ?? 0}.`);
        }
        else
            console.error(`Error obtaining the value for mainSelect, line ${extLine(new Error())}.
        Obtained value: ${mainSelect?.value}`);
        if (mainSelect.value === "muitoIntenso" ||
            formTMBTypeElement.value === "tinsley") {
            GlobalStyle.fadeElement(lockGordCorpLvl, "0");
            setTimeout(() => {
                lockGordCorpLvl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-unlock" viewBox="0 0 16 16">
        <path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2M3 8a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1z"/>
      </svg>`;
                GlobalStyle.fadeElement(lockGordCorpLvl, "1");
            }, 500);
        }
        else {
            GlobalStyle.fadeElement(lockGordCorpLvl, "0");
            setTimeout(() => {
                lockGordCorpLvl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lock" viewBox="0 0 16 16">
        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2M5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1"/>
        </svg>`;
                GlobalStyle.fadeElement(lockGordCorpLvl, "1");
            }, 500);
        }
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for matchTMBElements()", mainSelect, formTMBTypeElement, spanFactorAtleta, gordCorpLvl, lockGordCorpLvl, IMC);
}
export function updatePGC(person, parentEl, numRef = 1, context = "cons") {
    let PGC = 0, targInpPGC = null, targInpSumDCut = null;
    if (person &&
        parentEl &&
        typeof numRef === "number" &&
        (context === "cons" || context === "col")) {
        switch (context) {
            case "cons":
                targInpPGC = parentEl.querySelector(`#inpPgc${numRef}Cel4_${numRef + 1}`);
                targInpSumDCut = parentEl.querySelector(`#tabInpRowDCut9_${numRef + 1}`);
                break;
            case "col":
                targInpPGC = parentEl.querySelector(`#inpPgc${numRef - 1}Cel4_${numRef}`);
                targInpSumDCut = parentEl.querySelector(`#tabInpRowDCut9_${numRef}`);
                break;
        }
        if ((targInpSumDCut instanceof HTMLInputElement ||
            targInpSumDCut instanceof HTMLSelectElement) &&
            targInpSumDCut.type === "number") {
            person.sumDCut =
                GlobalModel.parseNotNaN(targInpSumDCut?.value, 0, "float") || 0;
            targInpSumDCut.value = person.sumDCut.toString();
        }
        else
            ErrorHandler.inputNotFound(targInpSumDCut, "targInpSumDCut", extLine(new Error()));
        if ((targInpPGC instanceof HTMLInputElement ||
            targInpPGC instanceof HTMLSelectElement) &&
            targInpPGC.type === "number") {
            console.log("sumdcut capturado " + person.sumDCut);
            console.log("age capturada " + person.age);
            PGC =
                GlobalModel.parseNotNaN(person.calcPGC(person).toFixed(4), 0, "float") || 0;
            const PGCDecayArray = EdFisNutModel.evaluatePGCDecay(person, targInpPGC, PGC);
            if (PGCDecayArray[0] === true) {
                PGC = PGCDecayArray[1];
                targInpPGC.value = PGC.toFixed(2);
            }
            else
                targInpPGC.value = PGC.toFixed(4);
        }
        else
            ErrorHandler.inputNotFound(targInpPGC, "targInpPGC", extLine(new Error()));
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for updatePGC", `${JSON.stringify(person) || null}`, parentEl, numRef, context);
    if (PGC < 0) {
        console.warn(`PGC value defaulted. Obtained value: ${PGC || 0}`);
        PGC = 0;
    }
    return [PGC || 0, targInpSumDCut ?? null, targInpPGC ?? null];
}
export function updateAtvLvl(mainSelect, secondarySelect, atvLvl = "leve") {
    if ((mainSelect instanceof HTMLSelectElement ||
        mainSelect instanceof HTMLInputElement) &&
        (secondarySelect instanceof HTMLSelectElement ||
            secondarySelect instanceof HTMLInputElement) &&
        (atvLvl === "sedentario" ||
            atvLvl === "leve" ||
            atvLvl === "moderado" ||
            atvLvl === "intenso" ||
            atvLvl === "muitoIntenso")) {
        const returnedAtvLvl = GlobalHandler.updateSimpleProperty(mainSelect) || "";
        if (typeof returnedAtvLvl === "string") {
            atvLvl = returnedAtvLvl;
            secondarySelect.value = atvLvl;
        }
        else
            ErrorHandler.typeError("update for mainSelect in updateAtLvl()", returnedAtvLvl, "string", extLine(new Error()));
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for updateAtvLvl()", mainSelect, secondarySelect, atvLvl);
    return atvLvl || "leve";
}
export function defineTargInps(parentEl, numRef = 1, context = "cons") {
    const arrayTargInps = [];
    const validTargInps = [];
    if (parentEl instanceof HTMLElement &&
        (typeof numRef === "number" || typeof numRef === "string") &&
        typeof context === "string") {
        if (typeof numRef === "string") {
            numRef =
                numRef
                    ?.replaceAll(/["']/g, "")
                    ?.match(/^[0-9]{1,2}$/g)
                    ?.toString() ?? "";
            numRef && numRef !== ""
                ? (numRef = GlobalModel.parseNotNaN(numRef, 1))
                : ErrorHandler.stringError("convertendo Número de Consulta de string for número", numRef, extLine(new Error()));
        }
        if (typeof numRef === "number" &&
            (context === "cons" || context === "col")) {
            switch (context) {
                case "cons":
                    arrayTargInps.push(parentEl.querySelector(`#tabInpRowMedAnt2_${numRef + 1}`) ?? null);
                    arrayTargInps.push(parentEl.querySelector(`#tabInpRowMedAnt3_${numRef + 1}`) ?? null);
                    arrayTargInps.push(parentEl.querySelector(`#inpImc${numRef}Cel2_${numRef + 1}`) ?? null);
                    arrayTargInps.push(parentEl.querySelector(`#inpMlg${numRef}Cel3_${numRef + 1}`) ?? null);
                    arrayTargInps.push(parentEl.querySelector(`#inpTmb${numRef}Cel5_${numRef + 1}`) ?? null);
                    arrayTargInps.push(parentEl.querySelector(`#inpGet${numRef}Cel6_${numRef + 1}`) ?? null);
                    break;
                case "col":
                    arrayTargInps.push(parentEl.querySelector(`#tabInpRowMedAnt2_${numRef}`) ?? null);
                    arrayTargInps.push(parentEl.querySelector(`#tabInpRowMedAnt3_${numRef}`) ?? null);
                    arrayTargInps.push(parentEl.querySelector(`#inpImc${numRef - 1}Cel2_${numRef}`) ?? null);
                    arrayTargInps.push(parentEl.querySelector(`#inpMlg${numRef - 1}Cel3_${numRef}`) ?? null);
                    arrayTargInps.push(parentEl.querySelector(`#inpTmb${numRef - 1}Cel5_${numRef}`) ?? null);
                    arrayTargInps.push(parentEl.querySelector(`#inpGet${numRef - 1}Cel6_${numRef}`) ?? null);
                    break;
            }
        }
        else
            ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for defineTargInps", numRef, context);
        if (arrayTargInps?.length === 6) {
            for (let iA = 0; iA < arrayTargInps.length; iA++) {
                if (arrayTargInps[iA] instanceof HTMLInputElement ||
                    arrayTargInps[iA] instanceof HTMLSelectElement)
                    validTargInps.push(arrayTargInps[iA]);
                else
                    ErrorHandler.inputNotFound(arrayTargInps[iA], `arrayTargInps ${enumTargInpTypes[iA]}`, extLine(new Error()));
                arrayTargInps[iA] = null;
            }
        }
        else
            ErrorHandler.elementNotPopulated(arrayTargInps, "arrayTargInps", extLine(new Error()));
        if (validTargInps?.length === 6)
            return validTargInps;
        else
            while (validTargInps?.length !== 6)
                validTargInps.push(null);
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "argument for defineTargInps()", parentEl, numRef, context);
    return validTargInps;
}
export function switchRowAtivFis(container, rowCountAtivFisRot = 3, rowCountAtivFisProp = 3) {
    if (container instanceof HTMLButtonElement) {
        if (container.classList.contains("addAtFisRot")) {
            addRowAtivFis(rowCountAtivFisRot);
            rowCountAtivFisRot++;
        }
        else if (container.classList.contains("removeAtFisRot"))
            rowCountAtivFisRot = removeRowAtivFis(rowCountAtivFisRot);
        else if (container.classList.contains("addAtFisProp")) {
            addRowAtivFis(rowCountAtivFisProp, "Prop");
            rowCountAtivFisProp++;
        }
        else if (container.classList.contains("removeAtFisProp"))
            rowCountAtivFisProp = removeRowAtivFis(rowCountAtivFisProp, "Prop");
    }
    else
        ErrorHandler.elementNotFound(container, "container for switcRowAtivFis", extLine(new Error()));
    return [rowCountAtivFisRot, rowCountAtivFisProp];
}
export function addRowAtivFis(count = 3, context = "Rot") {
    const tBodyContainer = document.getElementById(`tbodyAtFis${context}`);
    let title = "Rotineira";
    if (context === "rot")
        context = "Rot";
    if (context === "prop")
        context = "Prop";
    if (context === "Prop")
        title = "Proposta";
    if (typeof context === "string" && tBodyContainer) {
        const newRow = document.createElement("tr");
        newRow.className = `tabRowAtFis${context}`;
        newRow.id = `tabRowAtFis${context}Id${count}`;
        newRow.innerHTML = `
    <td class="tabCelAtFis tabCelAtFis${context}" id="tabCelRowAtFis${context}${count}_1" itemprop="celAtFis${context}">${count - 1}&#41</td>
    <td class="tabCelAtFis tabCelAtFis${context} tabCelLeft" id="tabCelRowAtFis${context}${count}_2" itemprop="celAtFis${context}">
      <input type="text" min="0" max="255" class="tabInpAtFis${context} tabInpRowAtFis${context}2 form-control" id="tabInpRowAtFis${context}${count}_1" itemprop="inpAtFis${context}" data-title="Atividade_Fisica_${title}_Nome_1" required />
    <td class="tabCelAtFis tabCelAtFis${context} tabCelLeft" id="tabCelRowAtFis${context}${count}_3" itemprop="celAtFis${context}">
      <input type="number" min="0" max="255" class="inpAtivFis tabInpAtFis${context} tabInpRowAtFis${context}2 form-control" id="tabInpRowAtFis${context}${count}_2" itemprop="inpAtFis${context}" data-title="Atividade_Fisica_${title}_NSemana_1" required />
    </td>
    <td class="tabCelAtFis tabCelAtFis${context}" id="tabCelRowAtFis${context}${count}_4" itemprop="celAtFis${context}">
      <input type="number" min="0" max="255" class="tabInpAtFis${context} tabInpRowAtFis${context}2 form-control" id="tabInpRowAtFis${context}${count}_3" itemprop="inpAtFis${context}" data-title="Atividade_Fisica_${title}_SessãoMin_1" required />
    </td>
    <td class="tabCelAtFis tabCelAtFis${context} tabCelRight" id="tabCelRowAtFis${context}${count}_5" itemprop="celAtFis${context}">
      <input type="number" min="0" max="255" class="tabInpAtFis${context} tabInpRowAtFis${context}2 form-control" id="tabInpRowAtFis${context}${count}_4" itemprop="inpAtFis${context}" data-title="Atividade_Fisica_${title}_Meses_1" required />
    </td>
      `;
        tBodyContainer.appendChild(newRow);
        newRow.querySelectorAll('input[type="number"]').forEach(numInp => {
            numInp.addEventListener("input", () => GlobalModel.numberLimit(numInp));
        });
        newRow.querySelectorAll('input[type="text"]').forEach(textEl => {
            textEl.addEventListener("input", () => GlobalModel.autoCapitalizeInputs(textEl, GlobalModel.checkAutoCorrect(document.querySelector('button[id^="deactAutocorrectBtn"]'))));
        });
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for addRowAtivFis", context, tBodyContainer);
}
export function removeRowAtivFis(count = 4, context = "Rot") {
    if (context === "rot")
        context = "Rot";
    if (context === "prop")
        context = "Prop";
    const rowToRemove = document
        .getElementById(`tabAtFis${context}`)
        ?.children?.namedItem(`tbodyAtFis${context}`)
        ?.children?.namedItem(`tabRowAtFis${context}Id${count - 1}`);
    if (rowToRemove &&
        count > 3 &&
        rowToRemove.id !== `tabRowAtFis${context}Id2`) {
        rowToRemove.remove();
        count -= 1;
    }
    else
        ErrorHandler.elementNotFound(rowToRemove, "rowToRemove in removeRowAtivFis", extLine(new Error()));
    return count;
}
export function switchRowComorb(comorbContainer, rowCountComorb = 3) {
    const parentTab = document.getElementById("tabComorb");
    if (comorbContainer?.tagName === "BUTTON" &&
        comorbContainer?.id === "addComorb" &&
        parentTab) {
        const newComorbRow = document.createElement("tr");
        newComorbRow.className = "contTerc tabRowComorb";
        newComorbRow.id = `tabRowComorb${rowCountComorb}`;
        newComorbRow.innerHTML = `
    <td class="tabCelComorb tabCelRowComorb${rowCountComorb}" id="tabCelRowComorb${rowCountComorb}_1">${rowCountComorb - 1}</td>
    <td class="tabCelComorb tabCelLeft tabCelRowComorb${rowCountComorb}" id="tabCelRowComorb${rowCountComorb}_2">
      <input type="text" class="tabInpComorb tabInpRowComorb${rowCountComorb} form-control" id="tablInpRowComorb${rowCountComorb}_2" data-title="Comorbidade_Nome_${rowCountComorb}" required />
    </td>
    <td class="tabCelComorb tabCelRight tabCelRowComorb${rowCountComorb}" id="tabCelRowComorb${rowCountComorb}_3">
      <input type="date" class="tabInpComorb tabInpRowComorb${rowCountComorb} form-control" id="tablInpRowComorb${rowCountComorb}_3" data-title="Comorbidade_Data_${rowCountComorb}" required />
    </td>
    `;
        parentTab.appendChild(newComorbRow);
        newComorbRow.querySelectorAll('input[type="text"]').forEach(textEl => {
            textEl.addEventListener("input", () => GlobalModel.autoCapitalizeInputs(textEl, GlobalModel.checkAutoCorrect(document.querySelector('button[id^="deactAutocorrectBtn"]'))));
        });
        rowCountComorb++;
    }
    else if (comorbContainer?.tagName === "BUTTON" &&
        comorbContainer?.id === "removeComorb") {
        const comorbRowToRemove = document
            .getElementById("tabComorb")
            ?.children?.namedItem(`tabRowComorb${rowCountComorb - 1}`);
        console.dir(comorbRowToRemove);
        if (comorbRowToRemove &&
            rowCountComorb !== 3 &&
            comorbRowToRemove?.id !== "tabRowComorb2") {
            comorbRowToRemove.remove();
            rowCountComorb--;
        }
        else
            ErrorHandler.elementNotFound(comorbRowToRemove, "comorbRowToRemove in switchRowComorb", extLine(new Error()));
    }
    else
        ErrorHandler.elementNotFound(comorbContainer, "comorbContainer in switchRowComorb", extLine(new Error()));
    return rowCountComorb;
}
export function switchRequiredCols(elements, numCons = 1, areNumConsOpsValid = true) {
    const [numConsElement, consTablesFs, tabDC] = elements;
    const tabSVi = document.getElementById("tabProgSVi");
    const tabMedAnt = document.getElementById("tabMedAnt");
    const tabIndPerc = document.getElementById("tabIndPerc");
    if (Array.from(elements)?.every(el => el instanceof HTMLElement) &&
        consTablesFs instanceof HTMLElement &&
        tabDC instanceof HTMLTableElement &&
        tabSVi instanceof HTMLTableElement &&
        tabMedAnt instanceof HTMLTableElement &&
        tabIndPerc instanceof HTMLTableElement &&
        (numConsElement instanceof HTMLSelectElement ||
            numConsElement instanceof HTMLInputElement) &&
        typeof numCons === "number" &&
        areNumConsOpsValid === true) {
        numCons = GlobalModel.parseNotNaN(GlobalHandler.updateSimpleProperty(numConsElement) ?? "0");
        if (typeof numCons === "number" && numCons > 0 && numCons <= 3) {
            //inicia construção de matriz para reset de required na tabela
            const totalTables = consTablesFs?.querySelectorAll("table");
            const totalRows = consTablesFs?.querySelectorAll("tr");
            let nTotalRows = 0;
            totalRows?.length > 0
                ? (nTotalRows = totalRows.length - totalTables.length)
                : ErrorHandler.elementNotPopulated(totalRows, "NodeList of <tr> in switchRequiredCols()", extLine(new Error()));
            const totalCols = consTablesFs?.querySelectorAll("col");
            let nTotalCols = 0;
            totalCols?.length > 0
                ? (nTotalCols = totalCols.length - totalTables.length)
                : ErrorHandler.elementNotPopulated(totalCols, "NodeList of <col> in switchRequiredCols()", extLine(new Error()));
            let nTotalMatrixValidAxes = 0;
            nTotalRows > 0 && nTotalCols > 0
                ? (nTotalMatrixValidAxes = nTotalRows * nTotalCols)
                : console.error(`Error building the matrix for filling the axes.
          Obtained number of rows: ${nTotalRows ?? 0};
          Obtained number of columns: ${nTotalCols ?? 0}.`);
            //captura elementos de input para reset baseado nas matrizes inpsCells e nTotalMatrixValidAxes
            const inpsCellsSVi = tabSVi?.querySelectorAll(".tabInpProgSVi");
            const inpsCellsMedAnt = tabMedAnt?.querySelectorAll(".tabInpProgMedAnt");
            const inpsCellsDC = tabDC?.querySelectorAll(".tabInpProg");
            const inpsCellsIndPerc = tabIndPerc?.querySelectorAll(".inpInd");
            const inpsCells = [
                ...inpsCellsSVi,
                ...inpsCellsMedAnt,
                ...inpsCellsDC,
                ...inpsCellsIndPerc,
            ];
            //reseta o atributo required das cells para novas atribuições de required
            if (inpsCells?.length > 0 &&
                inpsCells.length === nTotalMatrixValidAxes / totalTables.length) {
                inpsCells.forEach(inpCel => {
                    inpCel instanceof HTMLInputElement
                        ? (inpCel.required = false)
                        : ErrorHandler.inputNotFound(inpCel, `inpCel id ${inpCel?.id}`, extLine(new Error()));
                });
            }
            else
                console.error(`Error defining .length of <input> array in the cells.
        Obtained number: ${inpsCells.length ?? 0};
        Equals to the desired number for filling the axes: ${inpsCells.length === nTotalMatrixValidAxes ?? false};
        Accepted number: ${nTotalMatrixValidAxes / totalTables.length};
        Obtained number of <input> Elements for Sinais Vitais: ${inpsCellsSVi?.length ?? 0};
        Obtained number of <input> Elements for Medidas Antropométricas: ${inpsCellsMedAnt?.length ?? 0};
        Obtained number of <input> Elements for Dobras Cutâneas: ${inpsCellsDC?.length ?? 0};
        Obtained numbe of <input> Elements for Índices e Percentuais: ${inpsCellsIndPerc?.length ?? 0}.`);
            //determinação das novas cells required
            //validação das NodeLists de Inputs nas células
            const validInpsNodeLists = [
                validateTabInpList(inpsCellsSVi, defineMatrixAxes(tabSVi)) ?? false,
                validateTabInpList(inpsCellsMedAnt, defineMatrixAxes(tabMedAnt)) ??
                    false,
                validateTabInpList(inpsCellsDC, defineMatrixAxes(tabDC)) ?? false,
                validateTabInpList(inpsCellsIndPerc, defineMatrixAxes(tabIndPerc)) ??
                    false,
            ];
            let consRequiredCellsSVi = [], consRequiredCellsMedAnt = [], consRequiredCellsDC = [], consRequiredCellsIndPerc = [];
            //validação de NodeLists para inputs nas tabelas
            if (validInpsNodeLists.every(inpsNodeListValidation => inpsNodeListValidation === true)) {
                /* percorre a tabela usando o número de consulta como números de ciclos
                ou seja, length dos arrays formados pelas querries === length do número de consulta === número de colunas
                + são extraídas as células de interesse, com base na .id relativa à coluna, e então populam requiredCels */
                for (let iC = 0; iC < numCons; iC++) {
                    const filterPattern = new RegExp(`_${iC + 2}`);
                    consRequiredCellsSVi.push(...(filterCellsPattern(inpsCellsSVi, filterPattern, iC) ?? []));
                    consRequiredCellsMedAnt.push(...(filterCellsPattern(inpsCellsMedAnt, filterPattern, iC) ?? []));
                    consRequiredCellsDC.push(...(filterCellsPattern(inpsCellsDC, filterPattern, iC) ?? []));
                    consRequiredCellsIndPerc.push(...(filterCellsPattern(inpsCellsIndPerc, filterPattern, iC, "name") ?? []));
                }
            }
            else
                console.error(`Error validating NodeLists of inputs in tables.
        Obtained validation array for NodeLists: ${JSON.stringify(validInpsNodeLists) || null}`);
            const flatRequiredCells = [
                ...consRequiredCellsSVi,
                ...consRequiredCellsMedAnt,
                ...consRequiredCellsDC,
                ...consRequiredCellsIndPerc,
            ].flat(1);
            if (flatRequiredCells?.length > 0 &&
                flatRequiredCells.length === nTotalRows * numCons) {
                flatRequiredCells.forEach(fReqCel => {
                    GlobalStyle.highlightChange(fReqCel, "red", "both");
                    if (fReqCel instanceof HTMLInputElement ||
                        fReqCel instanceof HTMLTextAreaElement ||
                        fReqCel instanceof HTMLSelectElement)
                        fReqCel.required = true;
                });
            }
            else
                ErrorHandler.elementNotPopulated(flatRequiredCells, "flatRequiredCells", extLine(new Error()));
        }
        else
            console.error(`Error updating Número de Consulta.
          Obtained number: ${numCons ?? 0}`);
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for switchRequiredCols()", `${JSON.stringify(elements)}`, consTablesFs, tabDC, tabSVi, tabMedAnt, tabIndPerc, numConsElement, numCons, areNumConsOpsValid);
}
export function defineMatrixAxes(tab) {
    let matrixValidAxes = 0;
    if (tab instanceof HTMLTableElement) {
        const nRows = tab.querySelectorAll("tr");
        const nCols = tab.querySelectorAll("col");
        nRows?.length > 0 && nCols?.length > 0
            ? (matrixValidAxes = (nRows.length - 1) * (nCols.length - 1))
            : console.error(`Error validating number of rows in the table for Sinais Vitais.
    Obtained number of rows: ${nRows?.length ?? 0};
    Obtained number of columns: ${nCols?.length ?? 0}.`);
    }
    else
        ErrorHandler.elementNotFound(tab, "tab in defineMatrixAxes()", extLine(new Error()));
    return matrixValidAxes || 0;
}
export function validateTabInpList(inpsNL, nMatrix = 4) {
    let validInpNL = false;
    if ((inpsNL instanceof NodeList || Array.isArray(inpsNL)) &&
        typeof nMatrix === "number") {
        Array.from(inpsNL).every(inpCell => inpCell instanceof HTMLInputElement) &&
            inpsNL?.length > 0 &&
            inpsNL.length === nMatrix
            ? (validInpNL = true)
            : console.warn(`Error capturings inputs of Sinais Vitais with querry.
        Obtained array: ${JSON.stringify(inpsNL) || null};
        All Elements as HTMLInputElements: ${Array.from(inpsNL).every(inpCell => inpCell instanceof HTMLInputElement) ?? false};
        Length esperada: ${nMatrix ?? 0}.`);
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for validateTabInpList()", `${JSON.stringify(inpsNL) || null}`, nMatrix);
    return validInpNL || false;
}
export function filterCellsPattern(inpCells, filterPattern, columnNum = 2, testAtrib = "id") {
    if (Array.from(inpCells)?.every(inpCel => inpCel instanceof HTMLInputElement ||
        inpCel instanceof HTMLTextAreaElement ||
        inpCel instanceof HTMLSelectElement) &&
        filterPattern instanceof RegExp &&
        typeof columnNum === "number" &&
        typeof testAtrib === "string") {
        const arrCells = [];
        let filterInpCell = [];
        switch (testAtrib) {
            case "id":
                filterInpCell = Array.from(inpCells).filter(inpCell => filterPattern.test(inpCell.id));
                break;
            case "name":
                filterInpCell = Array.from(inpCells).filter(inpCell => filterPattern.test(inpCell.name));
                break;
            default:
                ErrorHandler.stringError("argument for testAtrib in filterCellsPatern()", testAtrib, extLine(new Error()));
        }
        if (filterInpCell?.length > 0) {
            arrCells.push(filterInpCell);
            return arrCells;
        }
        else
            console.warn(`Error filtering .id of Elements in the table for Sinais Vitais, column ${columnNum}.`);
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for filterCellsPattern()", `${JSON.stringify(inpCells) || null}`, `${JSON.stringify(filterPattern) || null}`, columnNum, testAtrib);
    return [[inpCells[0]]];
}
export function switchNumConsTitles(consTitles, trioEl, numTitledCons = 1, numTabs = 1) {
    if (Array.from(consTitles)?.every(consTitle => consTitle instanceof HTMLElement) &&
        (trioEl instanceof HTMLSelectElement ||
            trioEl instanceof HTMLInputElement ||
            trioEl instanceof HTMLTextAreaElement) &&
        typeof numTitledCons === "number" &&
        typeof numTabs === "number") {
        const trioNums = [];
        const iniValue = parseInt(trioEl?.value) ?? 0;
        if (Number.isNaN(iniValue)) {
            for (let t = 0; t <= numTabs * numTabs - 1; t += numTitledCons / numTabs)
                trioNums.push(1, 2, 3);
        }
        else {
            for (let j = 0; j <= numTabs * numTabs - 1; j += numTitledCons / numTabs)
                trioNums.push(iniValue, iniValue + 1, iniValue + 2);
        }
        for (let i = 0; i < consTitles.length; i++)
            consTitles[i].textContent = `${trioNums[i] || `${1 + i}`}ª Consulta`;
        Array.from(document.getElementById("fsSubProgConsInd")?.querySelectorAll("table") ??
            [])
            ?.map(table => [
            ...Array.from(table.querySelectorAll("input")),
            ...Array.from(table.querySelectorAll("textarea")),
            ...Array.from(table.querySelectorAll("select")),
        ])
            ?.flat(1)
            .forEach(input => {
            if ((input instanceof HTMLInputElement ||
                input instanceof HTMLTextAreaElement ||
                input instanceof HTMLSelectElement) &&
                input.dataset.title &&
                /[0-9]/g.test(input.dataset.title)) {
                const indexNum = input.dataset.title.search(/[0-9]/g);
                input.dataset.title =
                    input.dataset.title.slice(0, indexNum) +
                        `${0 + trioEl.value}` +
                        input.dataset.title.slice(indexNum + 1);
            }
            else
                ErrorHandler.inputNotFound(input, `input id ${input?.id}`, extLine(new Error()));
        });
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for switchNumConsTitles", `${JSON.stringify(consTitles) || null}`, trioEl, numTitledCons, numTabs);
}
export function createArraysRels(arrayRows, btnId = "", protocolValue = "pollock3") {
    let colAcc = 0;
    if (arrayRows?.every(row => row instanceof HTMLTableRowElement) &&
        typeof btnId === "string" &&
        btnId?.match(/(?<=_)[0-9]+/) &&
        btnId?.match(/[0-9]+(?=_)/) &&
        typeof protocolValue === "string") {
        const btnCol = GlobalModel.parseNotNaN(btnId?.match(/(?<=_)[0-9]+/)?.toString() ?? "0", 1);
        const targColInps = arrayRows.map(row => Array.from(row.querySelectorAll("input")).filter(inp => inp.id?.match(`_${btnCol.toString()}`) ?? false)[0]);
        const inpsIds = targColInps.map(inp => inp?.id);
        if (inpsIds.length === arrayRows.length) {
            //define qual coluna será utilizada de acordo com a posição do botão e validando se há algum preenchimento na coluna
            const protocoloNum = GlobalModel.parseNotNaN(protocolValue.slice(-1));
            if (protocoloNum === 3 || protocoloNum === 7) {
                for (let iC = 0; iC < arrayRows.length; iC++) {
                    if (arrayRows[iC].hidden === true)
                        continue;
                    colAcc += GlobalModel.parseNotNaN(targColInps[iC].value);
                }
            }
            else
                console.error(`Erro obtaining the protocol number.
        Obtained number: ${protocoloNum ?? 0}`);
        }
        else
            console.error(`Error validating length of columnValues.`);
        const sumInp = document.getElementById(`tabInpRowDCut9_${btnCol}`);
        sumInp instanceof HTMLInputElement
            ? (sumInp.value = colAcc.toString())
            : console.error(`Error finding input for sum of skin folds.`);
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for createArrayRels()", `${JSON.stringify(arrayRows) || null}`, btnId, protocolValue);
    return colAcc;
}
export function getConsultasNums(arrayRow) {
    let arrayConsultasNum = [];
    if (arrayRow instanceof HTMLTableRowElement) {
        const strConsultasNum = arrayRow.innerText.replaceAll(/[\D]/g, "");
        for (let iL = 0; iL < strConsultasNum.length; iL++) {
            arrayConsultasNum = arrayConsultasNum.concat(GlobalModel.parseNotNaN(strConsultasNum?.slice(0 + iL, 1 + iL) ?? "0", 1));
        }
    }
    else
        ErrorHandler.elementNotFound(arrayRow, "arrayRow in getConsultasNum", extLine(new Error()));
    return arrayConsultasNum || [1];
}
