//nesse file estão presentes principalmente as funções de manipulação dinâmica de texto e layout
import * as GlobalModel from "./gModel.js";
import * as GlobalStyle from "./gStyleScript.js";
import { JSONStorager, JSONTitleStorager } from "./classes.js";
import * as ErrorHandler from "./errorHandler.js";
import { extLine } from "./errorHandler.js";
// import React from 'react';
const mapIdsTitles = {
    firstNameId: "Primeiro_Nome",
    additionalNameId: "Sobrenome_do_Meio",
    familyNameId: "Último_Sobrenome",
    socialNameId: "Nome_Social",
    telAreaCodeId: "DDD",
    telId: "Telefone",
    telCountryCodeId: "Se_estrangeiro,_código_do_País",
    tel2AreaCodeId: "DDD_Do_Telefone_Secundário",
    tel2Id: "Telefone_Secundário",
    tel2CountryCodeId: "Se_estrangeiro(secundário),_código_do_País",
    email1Id: "Email",
    email2Id: "Email_Secundário",
    dateAgeId: "Idade",
    genid: "Gênero",
    genBirthRelId: "Identidade_em_relação_ao_gênero_designado_na_nascença",
    genTransId: "Estágio_da_Transição_Hormonal",
    genFisAlinId: "Alinhamento_de_características_físicas_predominante",
};
export function updateSimpleProperty(el) {
    if (el instanceof HTMLInputElement) {
        if (el.type === "radio" || el.type === "checkbox")
            return el.checked.toString();
        else if (el.type === "number") {
            if (Number.isNaN(parseFloat(el.value?.replaceAll(/[^0-9.,+-]/g, ""))))
                return 0;
            else
                return parseFloat(el.value?.replaceAll(/[^0-9.,+-]/g, "")) ?? 0;
        }
        else
            return el.value || "0";
    }
    else if (el instanceof HTMLSelectElement ||
        el instanceof HTMLTextAreaElement)
        return el.value;
    else
        ErrorHandler.inputNotFound(el, "el in updateSimpleProperty", extLine(new Error()));
    return "-1";
}
export function cursorCheckTimer() {
    const selection = window.getSelection();
    if (selection && selection.focusNode !== null) {
        setTimeout(() => {
            return selection.getRangeAt(0)?.startOffset;
        }, 3000);
    }
    return 0;
}
export function opRadioHandler(keydown, radioPairs) {
    if (keydown instanceof KeyboardEvent &&
        radioPairs.every(radioPair => radioPair instanceof HTMLInputElement)) {
        for (let i = 0; i < radioPairs.length; i += 2 //pulando de par em par
        ) {
            const radioYes = radioPairs[i];
            const radioNo = radioPairs[i + 1];
            if (!radioYes || !radioNo)
                break;
            if (radioYes instanceof HTMLInputElement &&
                (radioYes.type === "checkbox" || radioYes.type === "radio") &&
                radioNo instanceof HTMLInputElement &&
                (radioNo.type === "checkbox" || radioNo.type === "radio") &&
                !radioYes.checked &&
                !radioNo.checked) {
                if (keydown.altKey && keydown.key === "y") {
                    radioYes.focus();
                    radioYes.checked = true;
                    setTimeout(() => {
                        radioYes.blur();
                    }, 5000);
                    return;
                }
                else if (keydown.altKey && keydown.key === "n") {
                    radioNo.focus();
                    radioNo.checked = true;
                    setTimeout(() => {
                        radioNo.blur();
                    }, 5000);
                    return;
                }
            }
            else
                ErrorHandler.multipleElementsNotFound(extLine(new Error()), `validando radioYes id ${radioYes?.id ?? "UNDEFINED ID"} or radiosNo id ${radioNo?.id ?? "UNDEFINED ID"}`, radioYes, radioNo);
        }
    }
    else
        console.error(`Error validating KeyboardEvent in opRadioHandler.`);
}
export function cpbInpHandler(ev, radio) {
    if (ev instanceof Event &&
        radio instanceof HTMLInputElement &&
        radio?.parentElement?.parentElement) {
        const divAdds = radio.parentElement?.parentElement?.querySelectorAll("div[id^='divAdd']") ||
            radio.parentElement?.parentElement?.parentElement?.querySelectorAll("div[id^='divAdd']");
        const textAdds = radio.parentElement?.parentElement?.querySelectorAll("textarea[id^='textAdd']") ||
            radio.parentElement?.parentElement?.parentElement?.querySelectorAll("div[id^='textAdd']");
        //inclui ambos os tipos de eventos
        radio.parentElement?.parentElement?.parentElement
            ?.querySelectorAll("input[id^='Cpb'][id$='Yes']")
            ?.forEach((opRadioCheck, i) => {
            let divAdd = divAdds[i];
            divAdd ??= searchNextSiblings(radio.parentElement?.parentElement, "divAdd");
            if (divAdd instanceof HTMLElement &&
                opRadioCheck instanceof HTMLInputElement &&
                (opRadioCheck.type === "checkbox" || opRadioCheck.type === "radio")) {
                if (opRadioCheck.checked) {
                    GlobalStyle.fadeElement(divAdd, "0");
                    setTimeout(() => {
                        divAdd.style.display = "block";
                        setTimeout(() => {
                            GlobalStyle.fadeElement(divAdd, "1");
                        }, 100);
                    }, 400);
                }
                else {
                    GlobalStyle.fadeElement(divAdd, "0");
                    setTimeout(() => {
                        divAdd.style.display = "none";
                    }, 400);
                }
            }
        });
        if (!radio.classList.contains("radOD")) {
            let divAddPair = undefined;
            if (radio.parentElement?.nextElementSibling?.classList.contains("divAdd"))
                divAddPair = radio.parentElement.nextElementSibling;
            if (radio.parentElement?.parentElement?.nextElementSibling?.classList.contains("divAdd"))
                divAddPair = radio.parentElement.parentElement.nextElementSibling;
            else if (radio.parentElement?.parentElement?.parentElement?.nextElementSibling?.classList.contains("divAdd"))
                divAddPair =
                    radio.parentElement.parentElement.parentElement.nextElementSibling;
            if (divAddPair instanceof HTMLElement) {
                if (radio.checked && radio.id.match(/Yes/)) {
                    GlobalStyle.fadeElement(divAddPair, "0");
                    setTimeout(() => {
                        divAddPair.style.display = "block";
                        setTimeout(() => {
                            GlobalStyle.fadeElement(divAddPair, "1");
                        }, 100);
                    }, 400);
                }
                else {
                    GlobalStyle.fadeElement(divAddPair, "0");
                    setTimeout(() => {
                        divAddPair.style.display = "none";
                    }, 400);
                }
            }
        }
        const showTextAdd = (opRadioText, i, parent) => {
            if (opRadioText instanceof HTMLInputElement &&
                (opRadioText.type === "checkbox" || opRadioText.type === "radio") &&
                typeof i === "number") {
                let textAdd = textAdds[i];
                textAdd ??=
                    searchNextSiblings(parent, "textAdd") ||
                        searchNextSiblings(parent, "divAdd");
                if (textAdd instanceof HTMLElement) {
                    if (!opRadioText.checked) {
                        GlobalStyle.fadeElement(textAdd, "0");
                        setTimeout(() => {
                            textAdd.style.display = "none";
                        }, 400);
                    }
                    else {
                        GlobalStyle.fadeElement(textAdd, "0");
                        setTimeout(() => {
                            textAdd.style.display = "block";
                            setTimeout(() => {
                                GlobalStyle.fadeElement(textAdd, "1");
                            }, 100);
                        }, 400);
                    }
                }
            }
            else
                ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for showTextAdd", opRadioText, i);
        };
        [
            radio.parentElement?.parentElement,
            radio.parentElement?.parentElement?.parentElement,
        ].forEach(parent => {
            parent
                ?.querySelectorAll("input[id^='pb'][id$='Yes']")
                ?.forEach((opRadioText, i) => {
                showTextAdd(opRadioText, i, parent);
            });
        });
        const showClosestAddEl = (closestAddElement, antFamCheck) => {
            if (closestAddElement instanceof HTMLDivElement ||
                closestAddElement instanceof HTMLSpanElement) {
                if (antFamCheck instanceof HTMLInputElement &&
                    (antFamCheck.type === "checkbox" || antFamCheck.type === "radio") &&
                    !antFamCheck.checked) {
                    GlobalStyle.fadeElement(closestAddElement, "0");
                    setTimeout(() => {
                        closestAddElement.style.display = "none";
                    }, 400);
                }
                else {
                    GlobalStyle.fadeElement(closestAddElement, "0");
                    setTimeout(() => {
                        closestAddElement.style.display = "block";
                        setTimeout(() => {
                            GlobalStyle.fadeElement(closestAddElement, "1");
                        }, 100);
                    }, 400);
                }
            }
        };
        radio.parentElement?.parentElement
            ?.querySelectorAll("input[id^='antFam']")
            ?.forEach(antFamCheck => {
            const closestAddElement = antFamCheck?.parentElement?.nextElementSibling;
            showClosestAddEl(closestAddElement, antFamCheck);
        });
        radio.parentElement?.parentElement?.parentElement
            ?.querySelectorAll("input[id^='antFam']")
            ?.forEach(antFamCheck => {
            const closestAddElement = antFamCheck?.parentElement?.parentElement?.nextElementSibling;
            showClosestAddEl(closestAddElement, antFamCheck);
        });
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "localizando parent elements de Radio", radio, radio?.parentElement, radio?.parentElement?.parentElement);
}
export function deactTextInput(addressInps, nullRadios) {
    addressInps?.length > 0 && addressInps.length === nullRadios.length
        ? nullRadios.forEach(nullRadio => {
            const blockeableInput = nullRadio.parentElement?.parentElement?.querySelector(".inpLocNum");
            ["click", "dblclick"].forEach(event => {
                nullRadio.addEventListener(event, () => {
                    nullRadio instanceof HTMLInputElement && nullRadio.checked
                        ? blockeableInput?.setAttribute("disabled", "")
                        : blockeableInput?.removeAttribute("disabled");
                });
            });
        })
        : console.error("Number of Inputs and Radios unequal, aborting deactTextInput()");
}
export function doubleClickHandler(inpEl) {
    if (inpEl instanceof HTMLInputElement &&
        (inpEl.type === "checkbox" || inpEl.type === "radio")) {
        inpEl.checked = inpEl.checked ? false : true;
        cpbInpHandler(new Event("change"), inpEl);
    }
    else
        ErrorHandler.inputNotFound(inpEl, `inpEl id ${inpEl?.id ?? "UNDEFINED ID"}`, extLine(new Error()));
}
export function useCurrentDate(activation, dateBtn) {
    if (activation?.target === dateBtn && dateBtn instanceof HTMLButtonElement) {
        const currentDate = new Date();
        const targInputDate = searchPreviousSiblings(dateBtn, "inpDate");
        targInputDate instanceof HTMLInputElement && targInputDate.type === "date"
            ? (targInputDate.value =
                currentDate.getFullYear() +
                    "-" +
                    (currentDate.getMonth() + 1)
                        .toString()
                        .padStart(2, "0")
                        .replaceAll("'", "") +
                    "-" +
                    currentDate.getDate().toString().padStart(2, "0").replaceAll("'", ""))
            : ErrorHandler.inputNotFound(targInputDate, `targInputDate id ${targInputDate?.id ?? "UNDEFINED ID"}`, extLine(new Error()));
    }
    else
        ErrorHandler.elementNotFound(dateBtn, "arguments for useCurrentDate()", extLine(new Error()));
}
export function searchNextSiblings(currentElement, searchedSiblingClass) {
    let loopAcc = 0;
    while (currentElement?.nextElementSibling) {
        currentElement = currentElement.nextElementSibling;
        if (currentElement?.classList?.contains(searchedSiblingClass) ||
            loopAcc > 999)
            break;
        loopAcc++;
    }
    return currentElement;
}
export function searchPreviousSiblings(currentElement, searchedSiblingClass) {
    let loopAcc = 0;
    while (currentElement?.previousElementSibling) {
        currentElement = currentElement.previousElementSibling;
        if (currentElement?.classList?.contains(searchedSiblingClass) ||
            loopAcc > 999)
            break;
        loopAcc++;
    }
    return currentElement;
}
export function searchPreviousSiblingsById(currentElement, searchedSiblingId) {
    let loopAcc = 0;
    while (currentElement?.previousElementSibling) {
        currentElement = currentElement.previousElementSibling;
        if (currentElement?.id === searchedSiblingId || loopAcc > 999)
            break;
        loopAcc++;
    }
    return currentElement;
}
export function searchParents(currentElement, searchedParentClass) {
    let loopAcc = 0;
    while (currentElement?.parentElement) {
        currentElement = currentElement.parentElement;
        if (currentElement?.classList?.contains(searchedParentClass) ||
            loopAcc > 999)
            break;
        loopAcc++;
    }
    return currentElement;
}
export function changeToAstDigit(click, toFileInpBtn) {
    if (click instanceof Event &&
        toFileInpBtn instanceof HTMLButtonElement &&
        toFileInpBtn.textContent) {
        const inpAst = searchPreviousSiblings(toFileInpBtn, "inpAst") ||
            searchPreviousSiblings(toFileInpBtn, "imgAstDigit");
        if ((inpAst instanceof HTMLInputElement ||
            inpAst instanceof HTMLImageElement) &&
            inpAst.parentElement) {
            let labAst = document.querySelector(".labAst");
            const fileInp = document.createElement("input");
            fileInp.name = inpAst.name;
            fileInp.id = inpAst.id;
            fileInp.className = inpAst.className;
            if (new RegExp(/Usar/g).test(toFileInpBtn.textContent)) {
                fileInp.type = "file";
                fileInp.setAttribute("accept", "image/*");
                if (inpAst instanceof HTMLInputElement && inpAst.required)
                    fileInp.required = true;
                defineLabId(labAst, toFileInpBtn, fileInp);
                toFileInpBtn.textContent = "Retornar à Assinatura Escrita";
                if (toFileInpBtn.previousElementSibling instanceof HTMLButtonElement)
                    toFileInpBtn.previousElementSibling?.setAttribute("hidden", "");
                fileInp.addEventListener("change", chose => {
                    try {
                        let imgFile;
                        if (fileInp?.files)
                            imgFile = fileInp.files[0];
                        if (chose?.target instanceof HTMLInputElement &&
                            fileInp?.files &&
                            fileInp.files?.length > 0 &&
                            imgFile &&
                            imgFile.type?.startsWith("image") &&
                            fileInp.parentElement &&
                            labAst) {
                            const fileReader = new FileReader();
                            fileReader.onload = load => {
                                //definir lógica para carregamento
                                //inicia preparo para evento de carregamento
                                const imgAstDigt = document.createElement("img"); //cria container
                                fileInp.id = inpAst.id;
                                fileInp.className = inpAst.className;
                                Object.assign(imgAstDigt, {
                                    src: load.target?.result, //checa a url do file que será carregado
                                    innerHTML: "",
                                    id: fileInp.id,
                                    className: fileInp.className,
                                    alt: "Assinatura Digital",
                                    decoding: "async",
                                    loading: "eager",
                                    crossorigin: "anonymous",
                                    style: {
                                        maxWidth: "300px",
                                        maxHeight: "200px",
                                        overflow: "auto",
                                    },
                                });
                                fileInp.parentElement.replaceChild(imgAstDigt, fileInp);
                                defineLabId(labAst, toFileInpBtn, imgAstDigt);
                            };
                            fileReader.readAsDataURL(imgFile); //lê o file baseado na src carregada
                        }
                        else
                            throw new Error(`Error on selecting the file and/or finding the parent Element for the file input.
              chose.target: ${chose?.target ?? "UNDEFINED CHOSE"};
              fileInp: ${fileInp ?? "UNDEFINED INP"};
              files: ${fileInp?.files ?? "UNDEFINED FILES"};
              parentElement: ${fileInp?.parentElement ?? "UNDEFINED PARENT"}; 
              imgFile: ${imgFile ?? "UNDEFINED IMAGE"}; 
              imgFile.type: ${imgFile?.type ?? "UNDEFINED TYPE"}; 
              lab ${labAst ?? "UNDEFINED LABEL"}`);
                    }
                    catch (error) {
                        console.error(error.message);
                    }
                });
            }
            else if (new RegExp(/Retornar/g).test(toFileInpBtn.textContent)) {
                fileInp.type = "text";
                fileInp.setAttribute("required", "");
                defineLabId(labAst, toFileInpBtn, fileInp);
                toFileInpBtn.textContent = "Usar Assinatura Digital";
                toFileInpBtn.previousElementSibling?.removeAttribute("hidden");
                fileInp.addEventListener("input", () => GlobalModel.autoCapitalizeInputs(fileInp, GlobalModel.checkAutoCorrect(document.querySelector('button[id^="deactAutocorrectBtn"]') ||
                    document.querySelector('input[id^="deactAutocorrectBtn"]'))));
            }
            else
                ErrorHandler.stringError("textContent for toFileInpBtn", toFileInpBtn?.textContent, extLine(new Error()));
            inpAst.parentElement.replaceChild(fileInp, inpAst);
        }
        else
            ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for inpAst", inpAst, inpAst?.parentElement, toFileInpBtn);
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for changToAstDigit()", `${JSON.stringify(click) || null}`, toFileInpBtn, toFileInpBtn?.textContent);
}
export function defineLabId(labAst, toFileInpBtn, fileEl) {
    if (toFileInpBtn instanceof HTMLButtonElement &&
        (fileEl instanceof HTMLInputElement || fileEl instanceof HTMLImageElement)) {
        if (!labAst &&
            (toFileInpBtn.parentElement?.tagName === "LABEL" ||
                toFileInpBtn.parentElement?.tagName === "SPAN"))
            labAst = toFileInpBtn.parentElement;
        labAst.id = "spanAstPct";
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "argumentos para defineLabId", toFileInpBtn, fileEl);
}
export function resetarFormulario(click, toFileInpBtns, resetFormBtn = click?.target) {
    if ((click?.target instanceof HTMLButtonElement ||
        resetFormBtn instanceof HTMLButtonElement) &&
        Array.from(toFileInpBtns).every(fileBtn => fileBtn instanceof HTMLButtonElement)) {
        const formulario = document.getElementById("formAnamGId");
        const editableCite = document.querySelector('cite[contenteditable="true"]');
        const genBirthRel = document.getElementById("genBirthRelId");
        const genTrans = document.getElementById("genTransId");
        formulario instanceof HTMLFormElement
            ? formulario.reset()
            : ErrorHandler.elementNotFound(formulario, "formulario in resetarFormulario()", extLine(new Error()));
        if (editableCite) {
            editableCite.textContent = `--Nome`;
            GlobalModel.removeFirstClick(editableCite);
        }
        else
            ErrorHandler.elementNotFound(editableCite, "editableCite in resetarFormulario()", extLine(new Error()));
        if (genBirthRel instanceof HTMLSelectElement ||
            genBirthRel instanceof HTMLTextAreaElement ||
            genBirthRel instanceof HTMLInputElement) {
            genBirthRel.value = "cis";
            genBirthRel.hidden = true;
        }
        else
            ErrorHandler.inputNotFound(genBirthRel, "genBirthRel in resetarFormulario()", extLine(new Error()));
        if (genTrans instanceof HTMLSelectElement ||
            genTrans instanceof HTMLTextAreaElement ||
            genTrans instanceof HTMLInputElement) {
            genTrans.value = "avancado";
            genTrans.hidden = true;
        }
        else
            ErrorHandler.inputNotFound(genTrans, "genTrans in resetarFormulario()", extLine(new Error()));
        toFileInpBtns.forEach(toFileInpBtn => {
            if (toFileInpBtn?.textContent?.match(/Retornar/g))
                changeToAstDigit(click, toFileInpBtn);
        });
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for resetarFormulario()", `${JSON.stringify(click?.target)}` || null, `${JSON.stringify(toFileInpBtns)}` || null);
}
export function subForm(subButton) {
    window.alert("Sistema ainda não pronto\n...mas você teria enviado clicando aqui! :)");
}
export function getJSONDesc(inputs = [null]) {
    const titleElements = [];
    const closestValidElements = [];
    const closestValidElementsIds = [];
    const closestBooleanElements = [];
    const closestBooleanElementsIds = [];
    const inpValues = [];
    const inpIds = [];
    const JSONInpsStoreDescriptors = [];
    const JSONTitlesStoreDescriptors = [];
    let JSONInpsStore = [];
    let JSONTitlesStore = [];
    let titleAcc = 0;
    let nullTitleAcc = 0;
    //determinação do número de inputs de identificação cujos títulos são de interesse e construção de subarray para estes
    for (let k = 0; k < inputs.length; k++) {
        if (inputs[k]?.classList.contains("inpIdentif"))
            titleElements.push(inputs[k]);
    }
    //loop para construção dos arrays inicias de ids e values
    for (let z = 0; z < inputs.length; z++) {
        if (inputs[z] instanceof HTMLInputElement) {
            if (inputs[z]?.type === "radio" ||
                inputs[z]?.type === "checkbox") {
                inpIds.push(inputs[z]?.id ?? "null");
                inpValues.push(inputs[z]?.checked.toString() ?? "false");
            }
            else {
                inputs[z]?.id === "confrmLocId"
                    ? inpIds.push("confirmLoc")
                    : inpIds.push(inputs[z]?.id ?? "null");
                inpValues.push(inputs[z]?.value ?? "null");
            }
        }
        else if (inputs[z] instanceof HTMLTextAreaElement ||
            inputs[z] instanceof HTMLSelectElement) {
            inpIds.push(inputs[z]?.id ?? "null");
            inpValues.push(inputs[z]?.value ?? "null");
        }
        else if (inputs[z]?.contentEditable === "true" ||
            inputs[z]?.id === "citeNameId") {
            inpIds.push(inputs[z]?.id ?? "null");
            inpValues.push(inputs[z]?.textContent ?? "null");
        }
        else
            console.error(`Erro validando elemento. Elemento ${inputs[z] ?? "null"}; instância ${Object.prototype.toString
                .call(inputs[z])
                .slice(8, -1)}; id ${inputs[z]?.id ?? "null"}`);
    }
    //loop para ajuste dos elementos dos arrays de inputs e construção dos storager de inputs
    for (let j = 0; j < inputs.length; j++) {
        //filtragem de tipos primitivos de values
        typeof inpValues[j] === "string" && inpValues[j] === ""
            ? (inpValues[j] = inpValues[j].replace("", "null") ?? "null")
            : (inpValues[j] = inpValues[j]?.toString() ?? "null");
        //avaliador de ids nulas
        if (inpIds[j]?.match(/null/g) || !inpIds[j])
            console.warn(`Id null detectada. Título relativo: ${closestValidElements[j] ?? "null"}`);
        //criação do storager
        const nJSONInpStorager = new JSONStorager(inpIds[j], inpValues[j]);
        //criação da store
        if (nJSONInpStorager) {
            JSONInpsStore.push(nJSONInpStorager);
            const descriptor = nJSONInpStorager.showAllInfo;
            descriptor
                ? JSONInpsStoreDescriptors.push(descriptor.toString())
                : console.warn(`Erro validando descriptor para instância ${j} de JSONStorager`);
        }
        else {
            console.warn(`Erro validando instância ${j} de JSONStorager`);
        }
    }
    //loop para extrair títulos/labels de interesse
    for (let i = 0; i < titleElements.length; i++) {
        titleAcc++;
        //loop para múltiplas tentativas de localização do texto de interesse
        let closestParent = titleElements[i]?.closest("span") || titleElements[i]?.closest("label");
        if (closestParent) {
            let loopAcc = 0;
            while (loopAcc < 10 && closestParent?.textContent === "") {
                //loop para escalada genealógica até encontrar parent de interesse ou desistir após 10 iterações
                loopAcc++;
                closestParent =
                    closestParent?.closest("span") || closestParent?.closest("label");
                if (closestParent?.textContent !== "" || loopAcc > 10) {
                    break;
                }
            }
            if (closestParent?.textContent !== "") {
                if (closestParent?.textContent === "Sim" || //entrada em loop para eliminar parents com text sim/não (não informativo) ou desistir após 10 iterações
                    closestParent?.textContent === "Não") {
                    const booleanParentCopy = closestParent;
                    closestBooleanElements.push(booleanParentCopy?.textContent?.trim().replaceAll("\n", "") ??
                        `NULL ${titleElements[i]?.id ?? `Id null. Iteração do loop: ${titleAcc}`}`);
                    closestBooleanElementsIds.push(booleanParentCopy?.id ?? "null");
                    while (loopAcc < 10 &&
                        closestParent &&
                        (closestParent.textContent === "Sim" ||
                            closestParent.textContent === "Não")) {
                        loopAcc++;
                        closestParent =
                            closestParent?.closest("span") || closestParent?.closest("label");
                        if ((closestParent &&
                            closestParent?.textContent !== "Sim" &&
                            closestParent?.textContent !== "Não" &&
                            closestParent?.textContent !== "") ||
                            loopAcc > 10) {
                            closestValidElements.push(closestParent?.textContent?.trim().replaceAll("\n", "") ??
                                `NULL ${titleElements[i]?.id ??
                                    `Id null. Iteração do loop: ${titleAcc}`}`);
                            closestValidElementsIds.push(closestParent?.id ??
                                `NULL ${titleElements[i]?.id ??
                                    `Id null. Iteração do loop: ${titleAcc}`}`);
                            break;
                        }
                    }
                }
                else {
                    if (titleElements[i] instanceof HTMLInputElement &&
                        titleElements[i]?.type === "radio" &&
                        titleElements[i]?.id !== "") {
                        if (titleElements[i]?.nextElementSibling &&
                            titleElements[i]?.nextElementSibling instanceof
                                HTMLLabelElement &&
                            titleElements[i]?.nextElementSibling?.classList.contains("boolOp")) {
                            if (titleElements[i]?.id.match(/Yes/)) {
                                closestValidElements.push(titleElements[i]?.id?.slice(-3) ??
                                    "null" +
                                        closestParent?.textContent?.trim().replaceAll("\n", "") ??
                                    `NULL ${titleElements[i]?.id ??
                                        `Id null. Iteração do loop: ${titleAcc}`}`);
                            }
                            else if (titleElements[i]?.id.match(/No/)) {
                                closestValidElements.push(titleElements[i]?.id?.slice(-2) ??
                                    "null" +
                                        closestParent?.textContent?.trim().replaceAll("\n", "") ??
                                    `NULL ${titleElements[i]?.id ??
                                        `Id null. Iteração do loop: ${titleAcc}`}`);
                            }
                            else {
                                console.warn("Caso inesperado de boolOp Radio + Label");
                            }
                        }
                        else {
                            if ((titleElements[i] instanceof HTMLInputElement ||
                                titleElements[i] instanceof HTMLTextAreaElement) &&
                                titleElements[i]?.name === "nivelFumo") {
                                closestValidElements.push(titleElements[i]?.id?.slice(0, 1)?.toUpperCase() ??
                                    "null" +
                                        titleElements[i]?.id?.slice(1, 4) +
                                        "_" +
                                        titleElements[i]?.id?.slice(4, 8) ??
                                    `NULL ${titleElements[i]?.id ??
                                        `Id null. Iteração do loop: ${titleAcc}`}`);
                            }
                        }
                    }
                    else {
                        if (titleElements[i]?.classList.contains("opFumSubs") &&
                            titleElements[i]?.nextElementSibling &&
                            titleElements[i]?.nextElementSibling?.textContent !== "") {
                            closestValidElements.push(titleElements[i]?.nextElementSibling?.textContent +
                                "_" +
                                closestParent?.textContent?.trim().replaceAll("\n", "") ??
                                `NULL ${titleElements[i]?.id ??
                                    `Id null. Iteração do loop: ${titleAcc}`}`);
                        }
                        else {
                            if (titleElements[i]?.classList.contains("inpAntMed")) {
                                closestValidElements.push("Tratamento_Médico_" + titleElements[i]?.id.slice(-1) ??
                                    `NULL ${titleElements[i]?.id ??
                                        `Id null. Iteração do loop: ${titleAcc}`}`);
                            }
                            else {
                                titleElements[i]?.id === "citeNameId"
                                    ? closestValidElements?.push("Assinatura_Usuário" ?? "null")
                                    : closestValidElements?.push(closestParent?.textContent?.trim().replaceAll("\n", "") ??
                                        `NULL ${titleElements[i]?.id ??
                                            `Id null. Iteração do loop: ${titleAcc}`}`);
                            }
                        }
                    }
                    if (closestParent?.id !== "") {
                        //obtenção de ids dos 'parents'
                        //correção de id de interesse caso a do parent não esteja presente (atenção: desassocia id e text de interesse)
                        closestValidElementsIds.push(closestParent?.id ?? "null");
                    }
                    else if (closestParent?.id === "") {
                        const nextESibling = titleElements[i]?.nextElementSibling;
                        if (nextESibling &&
                            nextESibling instanceof HTMLLabelElement &&
                            nextESibling.textContent !== "") {
                            closestValidElementsIds.push(nextESibling.id ?? "null");
                        }
                        else {
                            const previousESibling = titleElements[i]?.previousElementSibling;
                            if (previousESibling &&
                                previousESibling instanceof HTMLLabelElement &&
                                previousESibling.textContent !== "") {
                                closestValidElementsIds.push(previousESibling.id ?? "null");
                            }
                            else if (titleElements[i] instanceof HTMLTextAreaElement &&
                                titleElements[i]?.placeholder !== "") {
                                closestValidElementsIds.push(titleElements[i]?.id ?? "null");
                            }
                            else {
                                console.warn(`Nenhuma id próxima válida retornada para o input ${titleElements[i]?.id}`);
                            }
                        }
                    }
                }
            }
            else if (closestParent?.textContent === "")
                console.warn(`Erro ao localizar textContent de parent`);
        }
        else {
            //se falha em parents, procura em siblings <label> ou em placeholders de textareas
            const previousSibling = titleElements[i]?.previousElementSibling;
            if (previousSibling instanceof HTMLLabelElement &&
                previousSibling.textContent !== "") {
                closestValidElements.push(previousSibling.textContent?.trim().replaceAll("\n", "") ??
                    `NULL ${titleElements[i]?.id ?? `Id null. Iteração do loop: ${titleAcc}`}`);
                closestValidElementsIds.push(previousSibling.id ?? "null");
            }
            else {
                if (titleElements[i] instanceof HTMLTextAreaElement &&
                    titleElements[i]?.placeholder) {
                    closestValidElements.push(titleElements[i]?.placeholder ??
                        `NULL ${titleElements[i]?.id ?? `Id null. Iteração do loop: ${titleAcc}`}`);
                    closestValidElementsIds.push(titleElements[i]?.id ?? "null");
                }
                else if (titleElements[i] instanceof HTMLInputElement &&
                    titleElements[i]?.type === "checkbox") {
                    if (titleElements[i]?.classList.contains("famOp")) {
                        const upperCaseMatch = titleElements[i]?.id?.match(/Fam/g);
                        if (upperCaseMatch && titleElements[i]?.id) {
                            const upperCaseIndex = titleElements[i]?.id.indexOf("Fam");
                            const slicedId = titleElements[i]?.id.slice(0, upperCaseIndex);
                            closestValidElements.push(slicedId +
                                "_" +
                                titleElements[i]?.nextSibling?.textContent?.replaceAll(/^[\s]+/g, "") ??
                                `NULL ${titleElements[i]?.id ??
                                    `Id null. Iteração do loop: ${titleAcc}`}`);
                        }
                        else {
                            closestValidElements.push(titleElements[i]?.nextSibling?.textContent?.replaceAll(/^[\s]+/g, "") ??
                                `NULL ${titleElements[i]?.id ??
                                    `Id null. Iteração do loop: ${titleAcc}`}`);
                        }
                    }
                    else if (titleElements[i]?.classList.contains("opHep")) {
                        closestValidElements.push("Hepatite_" +
                            titleElements[i]?.nextSibling?.textContent?.replaceAll(/^[\s]+/g, "") ?? "null");
                    }
                    else {
                        if (titleElements[i]?.id !== "confirmId") {
                            closestValidElements.push(titleElements[i]?.nextSibling?.textContent?.replaceAll(/^[\s]+/g, "") ??
                                `NULL ${titleElements[i]?.id ??
                                    `Id null. Iteração do loop: ${titleAcc}`}`);
                        }
                        else if (titleElements[i]?.id === "confirmId") {
                            closestValidElements.push("Concordo");
                        }
                    }
                    closestValidElementsIds.push(titleElements[i]?.id ?? "null");
                }
                else {
                    if (titleElements[i]?.classList.contains("opHAS")) {
                        closestValidElements.push(titleElements[i]?.nextSibling?.textContent?.trim() ??
                            `NULL ${titleElements[i]?.id ??
                                `Id null. Iteração do loop: ${titleAcc}`}`);
                        closestValidElementsIds.push(titleElements[i]?.id ?? "null");
                    }
                    else {
                        const nextESibling = titleElements[i]?.nextElementSibling;
                        if (nextESibling instanceof HTMLLabelElement &&
                            nextESibling.textContent !== "") {
                            closestValidElements.push(nextESibling.textContent?.trim().replaceAll("\n", "") ??
                                `NULL ${titleElements[i]?.id ??
                                    `Id null. Iteração do loop: ${titleAcc}`}`);
                            closestValidElementsIds.push(nextESibling.id ?? "null");
                        }
                        else
                            console.warn(`Erro validando parents, labels, placeholders e textContent. Id do Input: ${titleElements[i]?.id}; textContent ${titleElements[i]?.textContent}; placeholder ${titleElements[i]?.placeholder}; Última Instância de Parent avaliada ${Object.prototype.toString
                                .call(closestParent)
                                .slice(8, -1)}; Instância de Sibling Labels ${Object.prototype.toString
                                .call(previousSibling)
                                .slice(8, -1)} && ${Object.prototype.toString
                                .call(nextESibling)
                                .slice(8, -1)}`);
                    }
                }
            }
        }
    }
    //loop para ajuste dos elementos dos arrays de titles e construção dos storager de titles
    for (let l = 0; l < titleElements.length; l++) {
        //correção de múltiplos espaços em labels e titles
        const multipleSpaceMatches = closestValidElements[l]?.match(/\s\s/);
        if (closestValidElements[l] &&
            multipleSpaceMatches &&
            multipleSpaceMatches.length > 0) {
            const spaceMatchesArray = [];
            multipleSpaceMatches.forEach(multipleSpaceMatch => {
                const multipleSpaceIndex = closestValidElements[l]?.indexOf(multipleSpaceMatch) ?? 0;
                spaceMatchesArray.push(multipleSpaceIndex);
            });
            for (let m = 0; m < spaceMatchesArray.length; m++) {
                closestValidElements[l] =
                    closestValidElements[l]?.slice(0, spaceMatchesArray[m]).trim() ??
                        "null";
            }
        }
        //avaliador de labels e titles nulos
        if (closestValidElements[l]?.match(/[Nn][Uu][Ll][Ll]/g) ||
            closestValidElements[l] === undefined ||
            closestValidElements[l] === null) {
            let inpValue = inputs[l]?.value || "null";
            if (inputs[l] instanceof HTMLInputElement &&
                (inputs[l]?.type === "radio" ||
                    inputs[l]?.type === "checkbox")) {
                inpValue =
                    inputs[l]?.checked.toString() ?? "false";
            }
            nullTitleAcc++;
            console.warn(`Título nulo detectado: Número de acúmulo: ${nullTitleAcc}.
            Título: ${closestValidElements[l] || closestValidElements[l] || "null"};
            instância: ${Object.prototype.toString
                .call(closestValidElements[l])
                .slice(8, -1) ?? "undefined"};
            Id de input pareada: ${inputs[l]?.id ?? "null"};
            Valor de input pareado ${inpValue || "null"}`);
        }
        //criação do storager
        const nJSONTitleStorager = new JSONTitleStorager(closestValidElements[l]);
        //criação da store
        if (nJSONTitleStorager) {
            JSONTitlesStore.push(nJSONTitleStorager);
            const descriptor = nJSONTitleStorager.showInpTitle;
            descriptor
                ? JSONTitlesStoreDescriptors.push(descriptor.toString())
                : console.warn(`Erro validando descriptor para instância ${l} de JSONStorager`);
        }
        else
            console.warn(`Erro validando instância ${l} de JSONStorager`);
    }
    //filtro e validação da store
    if (JSONInpsStoreDescriptors?.length === JSONInpsStore?.length &&
        JSONTitlesStoreDescriptors?.length === JSONTitlesStore?.length) {
        const filter1JSONInpsStore = JSONInpsStore.filter(JSONEl => typeof JSONEl === "object");
        const filter1JSONTitlesStore = JSONTitlesStore.filter(JSONEl => typeof JSONEl === "object");
        if (filter1JSONInpsStore?.length === JSONInpsStore?.length &&
            filter1JSONTitlesStore?.length === JSONTitlesStore?.length) {
            JSONInpsStore = filter1JSONInpsStore;
            JSONTitlesStore = filter1JSONTitlesStore;
            const filter2JSONInpsStore = JSONInpsStore.filter(JSONEl => JSONEl instanceof JSONStorager);
            const filter2JSONTitlesStore = JSONTitlesStore.filter(JSONEl => JSONEl instanceof JSONTitleStorager);
            if (filter2JSONInpsStore?.length === JSONInpsStore?.length &&
                filter1JSONTitlesStore?.length === JSONTitlesStore?.length) {
                JSONInpsStore = filter2JSONInpsStore.sort();
                JSONTitlesStore = filter2JSONTitlesStore.sort();
                let JSONInpsStoreStringified = [];
                let JSONTitlesStoreStringified = [];
                //stringificação das stores
                JSONInpsStore.forEach(formEl => {
                    const elValues = formEl.showAllInfo;
                    const elValuesStringified = JSON.stringify(elValues);
                    JSONInpsStoreStringified.push(elValuesStringified);
                });
                JSONTitlesStore.forEach(formEl => {
                    const elValues = formEl.showInpTitle;
                    const elValuesStringified = JSON.stringify(elValues);
                    JSONTitlesStoreStringified.push(elValuesStringified);
                });
                JSONInpsStoreStringified = JSONInpsStoreStringified.sort();
                JSONTitlesStoreStringified = JSONTitlesStoreStringified.sort();
                //conclusão
                return JSONInpsStore &&
                    JSONInpsStoreStringified &&
                    JSONTitlesStore &&
                    JSONTitlesStoreStringified
                    ? [
                        JSONInpsStore,
                        JSONInpsStoreStringified,
                        JSONTitlesStore,
                        JSONTitlesStoreStringified,
                    ] //stringfied é a versão usada
                    : [null, null, null, null];
            }
            else {
                console.warn(`Erro validando classes de elementos no JSONStore. 
          Número de instâncias obtidas para inputs: ${filter2JSONInpsStore.length ?? "undefined"}; Número esperado: ${JSONInpsStore.length ?? "undefined"};
          Número de instâncias obtidas para titles: ${filter2JSONTitlesStore.length ?? "undefined"}; Número esperado: ${JSONTitlesStore.length ?? "undefined"}`);
                return [null, null, null, null];
            }
        }
        else {
            console.warn(`Erro validando tipos de elementos nas JSONStore. 
        Número de objetos obtidos para inputs: ${filter1JSONInpsStore.length ?? "undefined"}; Número esperado: ${JSONInpsStore.length ?? "undefined"};
        Número de objetos obtidos para titles: ${filter1JSONTitlesStore.length ?? "undefined"}; Número esperado: ${JSONTitlesStore.length ?? "undefined"}`);
            return [null, null, null, null];
        }
    }
    else {
        console.warn(`Length de JSON Store Descriptors inválida. 
      Length obtida para inputs: ${JSONInpsStoreDescriptors.length ?? "undefined"}; Length esperada: ${JSONInpsStore.length ?? "undefined"};
      Length obtida para titles: ${JSONTitlesStoreDescriptors.length ?? "undefined"}; Length esperada: ${JSONTitlesStore.length ?? "undefined"}`);
        return [null, null, null, null];
    }
}
export function createJSONAnchor(JSONBtn, formInpsDescriptor = [""]) {
    const formattedFormDescriptor = formatJSONFile(formInpsDescriptor);
    const JSONBlob = new Blob([formattedFormDescriptor[1]], {
        type: "application/json",
    });
    const JSONLink = document.createElement("a");
    JSONLink.id = "anchorJSON";
    JSONLink.className = JSONBtn.className;
    JSONLink.style.width = JSONBtn.style.width;
    JSONLink.style.height = JSONBtn.style.height;
    JSONLink.textContent = "Baixar JSON";
    JSONLink.href = URL.createObjectURL(JSONBlob);
    JSONLink.download = "formDataon";
    JSONBtn.replaceWith(JSONLink);
    return JSONLink;
}
export function formatJSONFile(formInpsDescriptor = [""]) {
    let formatFormDescIds = `{\n`;
    let formatFormDescTitles = ``;
    let formatFormDescIdsRead = `{\n`;
    let formatFormDescTitlesRead = `{\n`;
    let labAcc = 1;
    //geração das unidades formatadas
    for (let i = 0; i < formInpsDescriptor.length; i++) {
        const separationMatches = formInpsDescriptor[i].match(/",/g);
        if (separationMatches) {
            // const firstSepIndex = formInpsDescriptor[i].indexOf(",");
            const secondSepIndex = formInpsDescriptor[i].indexOf(",", formInpsDescriptor[i].indexOf(",") + 1);
            const lastSepIndex = formInpsDescriptor[i].lastIndexOf(separationMatches[0]);
            //formatação dos ids e values dos inputs
            let inpId = formInpsDescriptor[i].slice(secondSepIndex + 2, lastSepIndex + 1);
            let loopAcc = 0;
            while (inpId?.match(/,/g)) {
                const commaIndex = inpId.indexOf(",");
                inpId = inpId.slice(commaIndex + 1);
                if (!inpId?.match(/,/g) || loopAcc > 999)
                    break;
                loopAcc++;
            }
            const value = formInpsDescriptor[i].slice(lastSepIndex + 2, -1);
            const lab = mapIdsTitles[inpId.replaceAll(/"/g, "")];
            if (i === 89 && !inpId)
                //bug não resolvido ainda
                inpId = '"confirmLocId"';
            //construção e concatenação das unidades formatadas
            formatFormDescIds += `\t${inpId}: ${value}, \n`;
            formatFormDescIdsRead += `\t${labAcc}. ${inpId}: ${value}, \n`; //versões em lista numerada, para logs e enumeração posterior
            labAcc++;
            if (lab && lab !== "null" && lab !== "") {
                formatFormDescTitlesRead += `\t${labAcc}. ${lab} for ${inpId}: ${value}, \n`;
                formatFormDescTitles += `\t"${lab}": ${value}, \n`;
            }
        }
    }
    //ajustes finais nos descriptors e união
    const finalDescIds = (formatFormDescIds +
        `\n\n` +
        formatFormDescTitles +
        `}`).replace(", \n}", " \n}");
    const finalDescTitles = (`{` + formatFormDescTitles + `}`).replace(", \n}", " \n}");
    //para leitura em logs somente
    const finalDescIdsRead = (formatFormDescIdsRead + `}`)
        .replace(", \n}", " \n}")
        .replaceAll(/""null": "null",/g, "")
        .replaceAll(/""false": "false",/g, "")
        .replaceAll(/"null": "null",/g, "")
        .replaceAll(/"false": "false",/g, "")
        .replaceAll(/"false": "false"/g, "")
        .replaceAll(/"null": "null"/g, "")
        .replaceAll(/\t[0-9]{1,3}.\s:\s"null",\s\n/g, "")
        .replaceAll(/\t[0-9]{1,3}.\s:\s"false",\s\n/g, "")
        .replaceAll(/\t[0-9]{1,3}.\s\s\n/g, "");
    const finalDescTitlesRead = (formatFormDescTitlesRead + `}`)
        .replace(", \n}", " \n}")
        .replaceAll(/""null": "null",/g, "")
        .replaceAll(/""false": "false",/g, "")
        .replaceAll(/"null": "null",/g, "")
        .replaceAll(/"false": "false",/g, "")
        .replaceAll(/"false": "false"/g, "")
        .replaceAll(/"null": "null"/g, "")
        .replaceAll(/\t[0-9]{1,3}.\s:\s"null",\s\n/g, "")
        .replaceAll(/\t[0-9]{1,3}.\s:\s"false",\s\n/g, "")
        .replaceAll(/\t[0-9]{1,3}.\s\s\n/g, "");
    console.log(finalDescIdsRead);
    console.log(finalDescTitlesRead);
    return [finalDescTitles, finalDescIds];
}
export function regenerateJSONBtn(JSONLink, formInpsDescriptor = [""]) {
    const newJSONBtn = document.createElement("button");
    newJSONBtn.id = "btnJSON";
    newJSONBtn.className = JSONLink.className;
    newJSONBtn.style.width = JSONLink.style.width;
    newJSONBtn.style.height = JSONLink.style.height;
    newJSONBtn.textContent = "Regenerar JSON";
    JSONLink.replaceWith(newJSONBtn);
    setTimeout(() => {
        newJSONBtn.addEventListener("click", () => createJSONAnchor(newJSONBtn, formInpsDescriptor));
    }, 1000);
    // return newJSONBtn;
}
