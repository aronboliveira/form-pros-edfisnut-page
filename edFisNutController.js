//nesse file ocorrem principalmente as adições de listeners, sincronização das chamadas de funções para manipulação de informação/layout e validação dos elementos no DOM
import * as EdFisNutModel from "./edFisNutModel.js";
import * as EdFisNutHandler from "./edFisNutHandler.js";
import * as GlobalControl from "./gController.js";
import * as GlobalStyle from "./gStyleScript.js";
import * as GlobalModel from "./gModel.js";
import * as GlobalHandler from "./gHandlers.js";
import * as ErrorHandler from "./errorHandler.js";
import { extLine } from "./errorHandler.js";
import { Man, Woman, Neutro } from "./classes.js";
//funções seguem padrão: inicialização para o DOM com adição de listener + inserção de callback com retorno para leituras de inputs/changes
export function addListenerComorbBtns(rowCountComorb = 3) {
    const comorbBtnsArray = Array.from(document.getElementsByClassName("countComorb"));
    if (comorbBtnsArray?.length > 0) {
        comorbBtnsArray.forEach(comorbBtn => {
            comorbBtn instanceof HTMLButtonElement
                ? comorbBtn.addEventListener("click", () => {
                    rowCountComorb = EdFisNutHandler.switchRowComorb(comorbBtn, rowCountComorb);
                    return rowCountComorb;
                })
                : ErrorHandler.elementNotFound(comorbBtn, "comorbBtn", extLine(new Error()));
        });
    }
    else
        ErrorHandler.elementNotPopulated(comorbBtnsArray ?? "null", "comorbBtnsArray", extLine(new Error()));
    return [rowCountComorb, comorbBtnsArray];
}
export function addListenerAtivFisContBtns(rowCountAtivFisRot = 3, rowCountAtivFisProp = 3) {
    const ativFisContainerBtnsArray = Array.from(document.getElementsByClassName("countAtFis"));
    if (ativFisContainerBtnsArray?.length > 0) {
        ativFisContainerBtnsArray.forEach(ativFisContainerBtn => {
            ativFisContainerBtn instanceof HTMLButtonElement
                ? ativFisContainerBtn.addEventListener("click", () => {
                    [rowCountAtivFisRot, rowCountAtivFisProp] =
                        EdFisNutHandler.switchRowAtivFis(ativFisContainerBtn, rowCountAtivFisRot, rowCountAtivFisProp);
                    return [rowCountAtivFisRot, rowCountAtivFisProp];
                })
                : ErrorHandler.elementNotFound(ativFisContainerBtn, "ativFisContainerBtn", extLine(new Error()));
        });
    }
    else
        ErrorHandler.elementNotPopulated(ativFisContainerBtnsArray, "ativFisContainerBtnsArray", extLine(new Error()));
    return [rowCountAtivFisRot, rowCountAtivFisProp, ativFisContainerBtnsArray];
}
/* retornos são irrelevantes para o DOM após a primeira execução
depois disso, somente os callbacks dos eventos são utilizados
para atualizar variáveis no escopo léxico da função */
export function addListenerInnerTabs(consTablesFs, numColsCons = 1, areColGroupsSimilar = false) {
    if (consTablesFs instanceof HTMLElement &&
        typeof numColsCons === "number" &&
        typeof areColGroupsSimilar === "boolean") {
        [numColsCons, areColGroupsSimilar] = EdFisNutModel.checkInnerColGroups(consTablesFs, areColGroupsSimilar);
        const allTabledInps = consTablesFs.querySelectorAll("input");
        if (allTabledInps?.length > 0) {
            allTabledInps.forEach(tabInp => {
                //para apagar retornos negativos anômalos
                tabInp.addEventListener("input", () => {
                    if (parseInt(tabInp.value) < 0 ||
                        Number.isNaN(parseInt(tabInp.value)))
                        tabInp.value = "0";
                    return tabInp.value;
                });
            });
        }
        else
            ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for callbackInnerTabs()", consTablesFs, numColsCons, areColGroupsSimilar);
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for addListenerInnerTabs()", consTablesFs, numColsCons, areColGroupsSimilar);
    return [numColsCons || 0, areColGroupsSimilar || false] || [1, false];
}
export function addListenerNumCons(contextEls, //argumento é passado em array só porque precisa ir para função secundária
nums = [1, 1, 1], areNumConsOpsValid = true) {
    const [selectNumCons] = contextEls;
    let [_numColsCons, _numCons, _numConsLastOp] = nums;
    if (selectNumCons instanceof HTMLSelectElement &&
        typeof _numCons === "number" &&
        typeof areNumConsOpsValid === "boolean") {
        selectNumCons?.lastElementChild instanceof HTMLOptionElement
            ? (_numConsLastOp = GlobalModel.parseNotNaN(selectNumCons?.lastElementChild?.value ?? "1", 1))
            : ErrorHandler.elementNotFound(selectNumCons?.lastElementChild, "_numConsLastOp", extLine(new Error()));
        //validação da relação de options e colunas
        _numConsLastOp === _numColsCons - 1 && _numConsLastOp >= 3
            ? (areNumConsOpsValid = true)
            : ErrorHandler.maxNumberError(selectNumCons?.lastElementChild?.value ?? "1", "Options para Consultas", extLine(new Error()));
        _numCons = GlobalModel.parseNotNaN(selectNumCons?.value || "1") || 1;
        //listener para atualização de inputs target
        if (contextEls.every(el => el instanceof HTMLElement) &&
            areNumConsOpsValid === true) {
            selectNumCons.addEventListener("change", () => {
                numCons = callbackNumCons(contextEls, numCons);
                return numCons;
            });
        }
        else
            ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for validating options for numCons in addListenerNumCons()", ...contextEls, areNumConsOpsValid);
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for addListenerNumCons()", selectNumCons, _numCons, areNumConsOpsValid);
    return ([_numCons, _numConsLastOp || 1, areNumConsOpsValid || false] || [
        1,
        1,
        false,
    ]);
}
export function callbackNumCons(contextEls, numCons = 1) {
    const [selectNumCons] = contextEls;
    if (selectNumCons instanceof HTMLSelectElement &&
        contextEls.every(el => el instanceof HTMLElement) &&
        typeof numCons === "number") {
        numCons = GlobalModel.parseNotNaN(selectNumCons?.value || "1", 1) || 1;
        EdFisNutHandler.switchRequiredCols(contextEls, numCons, areNumConsOpsValid);
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for callbackNumCons()", selectNumCons, ...contextEls, numCons);
    return numCons || 1;
}
export function validateTitlesForTargs(numCons = 1) {
    const arrTargs = [];
    /*os titles são construídos somente para alertar se houver inadequação
      de entitulações no HTML (por ordem ou texto)*/
    [
        [
            document.querySelector(`#tabCelRowMedAnt2_1`),
            /Peso/g,
            "Weight",
            "tabInpRowMedAnt2_",
        ],
        [
            document.querySelector("#tabCelRowMedAnt3_1"),
            /Altura/g,
            "Height",
            "tabInpRowMedAnt3_",
        ],
        [
            document.querySelector("#tabCelRowIndPerc2_1"),
            /IMC/g,
            "IMC",
            `inpImc${numCons}Cel2_`,
        ],
        [
            document.querySelector("#tabCelRowIndPerc3_1"),
            /MLG/g,
            "MLG",
            `inpMlg${numCons}Cel3_`,
        ],
        [
            document.querySelector("#tabCelRowIndPerc5_1"),
            /TMB/g,
            "TMB",
            `inpTmb${numCons}Cel5_`,
        ],
        [
            document.querySelector("#tabCelRowIndPerc6_1"),
            /GET/g,
            "GET",
            `inpGet${numCons}Cel6_`,
        ],
        [
            document.querySelector("#tabCelRowDCut9_1"),
            /Soma/g,
            "SumDCut",
            "tabInpRowDCut9_",
        ],
        [
            document.querySelector("#tabCelRowIndPerc4_1"),
            /PGC/g,
            "PGC",
            `inpPgc${numCons}Cel4_`,
        ],
    ].forEach(context => {
        const [titleEl, regex, stringAtt, idPrefix] = context;
        if (titleEl?.textContent?.match(regex)) {
            const targ = document.querySelector(`#${idPrefix}${numCons + 1}`);
            targ instanceof HTMLInputElement
                ? arrTargs.push(targ)
                : ErrorHandler.inputNotFound(targ, `targInp${stringAtt}`, extLine(new Error()));
        }
        else
            ErrorHandler.matchError(`Title Row for fields about ${stringAtt}`, titleEl, titleEl?.textContent || "null", extLine(new Error()));
    });
    if (arrTargs.length < 8)
        console.error(`Invalid Elements for arrTargs: ${JSON.stringify(arrTargs)}`);
    while (arrTargs.length < 8)
        arrTargs.push(undefined);
    return arrTargs || [];
}
export function addListenerTrioReadNumCons(consTablesFs, numTotalColsCons = 1, numTotalTabsCons = 1) {
    const trioReadNumCons = document.getElementById("trioReadNumCons");
    if (consTablesFs instanceof HTMLElement &&
        typeof numTotalColsCons == "number" &&
        typeof numTotalTabsCons === "number") {
        trioReadNumCons instanceof HTMLInputElement &&
            trioReadNumCons.type === "number"
            ? trioReadNumCons.addEventListener("input", () => {
                callbackTrioReadNumCons(consTablesFs, trioReadNumCons, numTotalColsCons, numTotalTabsCons);
            })
            : ErrorHandler.inputNotFound(trioReadNumCons?.id, "trioReadNumCons", extLine(new Error()));
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for addListenerTrioReadNumCons()", consTablesFs, numTotalColsCons, numTotalTabsCons);
    return trioReadNumCons;
}
export function callbackTrioReadNumCons(consTablesFs, trioReadNumCons, numTotalColsCons = 1, numTotalTabsCons = 1) {
    const numConsTextHeadCels = Array.from(document.getElementsByClassName("numConsTextHeadCel"));
    if (consTablesFs instanceof HTMLElement &&
        (trioReadNumCons instanceof HTMLInputElement ||
            trioReadNumCons instanceof HTMLSelectElement) &&
        typeof numTotalColsCons == "number" &&
        typeof numTotalTabsCons === "number") {
        if (trioReadNumCons instanceof HTMLInputElement &&
            parseInt(trioReadNumCons.value) <= 0 &&
            trioReadNumCons.value !== "") {
            trioReadNumCons.value = "";
            const range = document.createRange();
            range.setStart(trioReadNumCons, 0);
        }
        const numTotalTitledColsCons = numTotalColsCons - numTotalTabsCons;
        numConsTextHeadCels.length === numTotalTitledColsCons
            ? EdFisNutHandler.switchNumConsTitles(numConsTextHeadCels, trioReadNumCons, numTotalTitledColsCons, numTotalTabsCons)
            : ErrorHandler.elementNotPopulated(numConsTextHeadCels, "numConsTextHeadCels in callbackTrioReadNumCons()", extLine(new Error()));
        numConsTextHeadCels.forEach(numConsCel => {
            GlobalStyle.highlightChange(numConsCel, "rgba(250, 30, 0, 0.3)");
        });
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for callbackTrioReadNumCons()", consTablesFs, trioReadNumCons, numTotalColsCons, numTotalTabsCons);
    return numConsTextHeadCels;
}
//a partir daqui, funções que só ocorrem com validação prévia do elemento
//textBodyEl é usado para leitura no DOM do alinhamento físico (mudanças manuais pelo usuário - tipo corporal aplicado)
export function addListenerTextBodyEl(_person, contextEls, areAllGenContChecked = false) {
    const [textBodytype, protocolo, tabDC, _genElement, genBirthRel, _genFisAlin,] = contextEls;
    if (typeof _person === "object" &&
        contextEls.every(el => el instanceof HTMLElement) &&
        (textBodytype instanceof HTMLSelectElement ||
            textBodytype instanceof HTMLInputElement) &&
        (genElement instanceof HTMLSelectElement ||
            genElement instanceof HTMLInputElement) &&
        (genFisAlin instanceof HTMLSelectElement ||
            genFisAlin instanceof HTMLInputElement) &&
        typeof areAllGenContChecked === "boolean") {
        textBodytype.addEventListener("change", () => {
            [person.gen, genElement.value, genFisAlin.value] = callbackTextBodyEl(person, [textBodytype, protocolo, tabDC, genElement, genBirthRel, genFisAlin], areAllGenContChecked);
            return [person.gen, genElement.value, genFisAlin.value];
        });
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for addListenerTextBodyEls()", `${JSON.stringify(_person) || null}`, `${JSON.stringify(contextEls) || null}`, textBodytype, genElement, genFisAlin, areAllGenContChecked);
    return ([
        _person?.gen || "masculino",
        _genElement?.value || "masculino",
        _genFisAlin?.value || "masculinizado",
    ] || ["masculino", "masculino", "masculinizado"]);
}
export function callbackTextBodyEl(person, contextEls, areAllGenContChecked = false) {
    if (typeof person === "object" &&
        (textBodytype instanceof HTMLSelectElement ||
            textBodytype instanceof HTMLInputElement) &&
        (protocolo instanceof HTMLSelectElement ||
            protocolo instanceof HTMLInputElement) &&
        tabDC instanceof HTMLTableElement &&
        (genElement instanceof HTMLSelectElement ||
            genElement instanceof HTMLInputElement) &&
        (genBirthRel instanceof HTMLSelectElement ||
            genBirthRel instanceof HTMLInputElement) &&
        (genFisAlin instanceof HTMLSelectElement ||
            genFisAlin instanceof HTMLInputElement) &&
        typeof areAllGenContChecked === "boolean") {
        EdFisNutModel.changeTabDCutLayout(protocolo, tabDC, textBodytype);
        person.gen = textBodytype.value;
        if ((genElement.value === "masculino" || genElement.value === "feminino") &&
            genBirthRel.value === "cis")
            genElement.value = textBodytype.value;
        switch (textBodytype.value) {
            case "masculino":
                genFisAlin.value = "masculinizado";
                break;
            case "feminino":
                genFisAlin.value = "feminilizado";
                break;
            case "neutro":
                genFisAlin.value = "neutro";
                break;
            default:
                ErrorHandler.stringError("verifying textBodytype.value", textBodytype?.value, extLine(new Error()));
        }
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for callbackTextBodyEls()", `${JSON.stringify(person) || null}`, `${JSON.stringify(contextEls) || null}`, textBodytype, protocolo, tabDC, genElement, genBirthRel, genFisAlin, areAllGenContChecked);
    return ([
        person?.gen || "masculino",
        genElement?.value || "masculino",
        genFisAlin?.value || "masculinizado",
    ] || ["masculino", "masculino", "masculinizado"]);
}
export function addListenerAutoFillBtn(_isAutoFillActive = true) {
    const autoFillBtn = document.getElementById("autoFillBtn");
    autoFillBtn instanceof HTMLButtonElement ||
        (autoFillBtn instanceof HTMLInputElement &&
            (autoFillBtn.type === "checkbox" || autoFillBtn.type === "radio"))
        ? autoFillBtn.addEventListener("click", () => {
            isAutoFillActive = callbackAutoFillBtn(autoFillBtn, isAutoFillActive);
            console.log(isAutoFillActive);
            return isAutoFillActive;
        })
        : ErrorHandler.elementNotFound(autoFillBtn, "autoFillBtn in addListenerAutoFillBtn()", extLine(new Error()));
    return [_isAutoFillActive, autoFillBtn];
}
export function callbackAutoFillBtn(autoFillBtn, isAutoFillActive = true) {
    autoFillBtn instanceof HTMLButtonElement ||
        (autoFillBtn instanceof HTMLInputElement &&
            (autoFillBtn.type === "checkbox" || autoFillBtn.type === "radio"))
        ? (isAutoFillActive = EdFisNutHandler.switchAutoFill(autoFillBtn, isAutoFillActive))
        : ErrorHandler.elementNotFound(autoFillBtn, "autoFillBtn in callbackAutoFillBtn()", extLine(new Error()));
    return isAutoFillActive;
}
export function addListenerAgeElement(_person, contextComp) {
    //obtenção de .age inicial com listener para input e atualização correspondente
    const ageElement = document.getElementById("dateAgeId");
    if (typeof _person === "object" &&
        "age" in _person &&
        typeof _person.age === "number" &&
        ageElement instanceof HTMLInputElement &&
        ageElement.type === "number" &&
        Array.isArray(contextComp)) {
        _person.age = parseFloat(ageElement.value) || 0;
        if (typeof _person.age === "number") {
            ageElement.addEventListener("input", () => {
                person.gen = document.getElementById("genId").value;
                const callbackResult = callbackAgeElement(person, contextComp, ageElement, isAutoFillActive);
                person.age = callbackResult[0];
                console.log("AUTOFILL " + isAutoFillActive);
                if (isAutoFillActive) {
                    numCons = callbackResult[1][0];
                    [targInpTMB, targInpGET, , targInpPGC] =
                        callbackResult[1][3].slice(4);
                    [TMB, GET, PGC] = callbackResult[1][2].slice(2);
                    [TMB, GET, PGC].forEach(ind => {
                        console.log("number obtained " + ind);
                    });
                    [targInpTMB, targInpGET, targInpPGC].forEach(targ => {
                        console.log("value catched " + targ.value);
                        GlobalStyle.highlightChange(targ, "red", "both");
                    });
                }
                return [person.age, contextComp[0][3], contextComp[1][3]];
            });
        }
        else
            ErrorHandler.typeError("_person.age", _person.age, "number", extLine(new Error()));
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for addListenerAgeElement()", `${JSON.stringify(_person)}`, _person?.age, ageElement, `${JSON.stringify(contextComp)}`, isAutoFillActive);
    return [_person?.age || 0, ageElement];
}
export function callbackAgeElement(person, contextComp, ageElement, isAutoFillActive = true) {
    let result = [
        numCons || 1,
        [person.weight || 0, person.height || 0, person.sumDCut || 0],
        contextComp[1][3] || [0, 0, 0, 0, 0], //[1][3] === arrIndexes
        contextComp[0][3] || [], //[0][3] === arrTargs
    ] || defaultResult;
    if ((person instanceof Man ||
        person instanceof Woman ||
        person instanceof Neutro) &&
        "age" in person &&
        typeof person.age === "number" &&
        ageElement instanceof HTMLInputElement &&
        ageElement.type === "number" &&
        Array.isArray(contextComp) &&
        typeof isAutoFillActive === "boolean") {
        person.age = EdFisNutHandler.validateEvResultNum(ageElement, person.age);
        //sem autofill, dá update somente em person.age
        if (isAutoFillActive)
            result = exeAutoFill(ageElement, isAutoFillActive, "cons");
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "argumentas for callbackAgeElement()", `${JSON.stringify(person)}`, person?.age, ageElement, `${JSON.stringify(contextComp)}`, isAutoFillActive);
    return [person?.age || 0, result || defaultResult] || [0, defaultResult];
}
export function addListenersGenContsEF(_person, genElement) {
    const genBirthRel = document.getElementById("genBirthRelId");
    const genTrans = document.getElementById("genTransId");
    const genFisAlin = document.getElementById("genFisAlinId");
    const textBodytype = document.getElementById("textBodytype");
    if (GlobalModel.checkAllGenConts(genElement, genBirthRel, genTrans, genFisAlin) &&
        typeof genValue === "string") {
        const arrGenConts = [
            genElement,
            genBirthRel,
            genTrans,
            genFisAlin,
        ];
        arrGenConts.forEach(genCont => {
            genCont.addEventListener("change", () => {
                person.gen =
                    GlobalModel.fluxGen(arrGenConts, genElement?.value) ||
                        "masculino";
                console.log("em callback de genconts " + person.gen);
                if ((genTrans.value !== "avancado" ||
                    genElement.value === "naoBinario") &&
                    genTrans.hidden === false &&
                    genFisAlin.hidden === false) {
                    textBodytype instanceof HTMLInputElement ||
                        textBodytype instanceof HTMLSelectElement
                        ? (textBodytype.value = person.gen)
                        : ErrorHandler.inputNotFound(textBodytype, "textBodyType in callback for gender Elements", extLine(new Error()));
                }
                return person.gen || "masculino";
            });
        });
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "gen Elements", genElement, genBirthRel, genTrans, genFisAlin);
    return _person.gen || "masculino";
}
export function addListenersSumDCutBtns(_person, contextEls, isAutoFillActive = true, _PGC = 0) {
    const [tabDC, protocolo] = contextEls;
    let [_targInpSumDCut, _targInpPGC] = contextEls[2];
    const sumDCBtns = tabDC?.querySelectorAll('button[id^="sumDCBtn"]') ?? [];
    const rowsDCArray = Array.from(tabDC?.getElementsByClassName("tabRowDCutMed") ?? new HTMLCollection()).filter(rowDC => rowDC instanceof HTMLTableRowElement);
    if (typeof _person === "object" &&
        tabDC instanceof HTMLTableElement &&
        (protocolo instanceof HTMLSelectElement ||
            protocolo instanceof HTMLInputElement) &&
        sumDCBtns?.length > 0 &&
        rowsDCArray?.length > 0 &&
        typeof _PGC === "number") {
        sumDCBtns.forEach(sumDCBtn => {
            sumDCBtn instanceof HTMLButtonElement
                ? sumDCBtn.addEventListener("click", () => {
                    [person.sumDCut, PGC, targInpSumDCut, targInpPGC] =
                        callbackSumDCutBtns(person, [
                            sumDCBtn,
                            protocolo,
                            rowsDCArray,
                            [targInpSumDCut, targInpPGC],
                        ], isAutoFillActive, PGC);
                    console.log("sumDCut obtido " + person.sumDCut);
                    return [person.sumDCut, PGC, targInpSumDCut, targInpPGC];
                })
                : ErrorHandler.elementNotFound(sumDCBtn, `sumDCBtn .id ${sumDCBtn?.id ?? "UNIDENTIFIED SUMDCBTN"}`, extLine(new Error()));
        });
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for addListenerSumDCutBtns()", `${JSON.stringify(_person)}`, tabDC, protocolo, `${JSON.stringify(sumDCBtns)}`, `${JSON.stringify(rowsDCArray)}`, _PGC);
    return [_person.sumDCut, _PGC, Array.from(sumDCBtns), rowsDCArray];
}
export function callbackSumDCutBtns(person, contextEls, isAutoFillActive = true, PGC = 0) {
    const [sumDCBtn, protocolo, rowsDCArray] = contextEls;
    [targInpSumDCut, targInpPGC] = contextEls[3];
    if (typeof person === "object" &&
        "sumDCut" in person &&
        typeof person.sumDCut === "number" &&
        sumDCBtn instanceof HTMLButtonElement &&
        Array.isArray(rowsDCArray) &&
        rowsDCArray.every(row => row instanceof HTMLTableRowElement) &&
        (protocolo instanceof HTMLSelectElement ||
            protocolo instanceof HTMLInputElement)) {
        person.sumDCut = EdFisNutHandler.createArraysRels(rowsDCArray, sumDCBtn?.id, protocolo.value);
        if (Number.isNaN(person.sumDCut) || person.sumDCut <= 0)
            person.sumDCut = 0;
        if (isAutoFillActive === true) {
            if ((person instanceof Man ||
                person instanceof Woman ||
                person instanceof Neutro) &&
                targInpPGC instanceof HTMLInputElement &&
                protocolo.value === "pollock3" &&
                person.age >= 0) {
                const numCol = EdFisNutHandler.getNumCol(sumDCBtn) ?? 0;
                typeof numCol === "number" && numCol > 0
                    ? ([PGC, targInpSumDCut, targInpPGC] = EdFisNutHandler.updatePGC(person, consTablesFs, numCol, "col"))
                    : ErrorHandler.typeError("obtaining column number", numCol, "number (natural)", extLine(new Error()));
            }
            else
                console.warn(`Error updating PGC using .sumDCut.
            Obtained person.age: ${person?.age || 0}
            Used Protocol: ${protocolo?.value || "null"} (Apenas pollock3 aceito, por enquanto);
            Is person classified? ${person instanceof Man ||
                    person instanceof Woman ||
                    person instanceof Neutro};
            Instance of the targeted input for PGC: ${Object.prototype.toString.call(targInpPGC).slice(8, -1) ?? "null"}`);
        }
        else
            console.warn(`Autofill not active. PGC not affected.`);
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for callbackBtns()", `${JSON.stringify(person)}`, sumDCBtn, `${JSON.stringify(rowsDCArray)}`, protocolo);
    return [person.sumDCut, PGC, targInpSumDCut, targInpPGC];
}
export function addListenerInpsWHS(_person, contextComp, isAutoFillActive = true) {
    const props = [_person.weight, _person.height, _person.sumDCut];
    const inpsWHS = [
        ...Array.from(document.getElementsByClassName("inpWeight")),
        ...Array.from(document.getElementsByClassName("inpHeight")),
        ...Array.from(document.getElementsByClassName("inpSumDCut")),
        document.querySelector(".selFactorAtletaClass"),
    ];
    const fillResult = (callbackResult, mainNum) => {
        if (isAutoFillActive) {
            let mainTarg;
            if (mainNum === 0) {
                targInpWeight = callbackResult[3][mainNum];
                mainTarg = targInpWeight;
            }
            else if (mainNum === 1) {
                targInpHeight = callbackResult[3][mainNum];
                mainTarg = targInpHeight;
            }
            else if (mainNum === 2) {
                targInpSumDCut = callbackResult[3].at(-mainNum);
                mainTarg = targInpSumDCut;
            }
            else
                console.error(`Error validating mainNum in fillResult()`);
            [targInpIMC, targInpMLG, targInpTMB, targInpGET, , targInpPGC] =
                callbackResult[3].slice(2);
            [
                mainTarg,
                targInpIMC,
                targInpMLG,
                targInpTMB,
                targInpGET,
                targInpPGC,
            ].forEach(targ => {
                console.log("value catched " + targ.value);
                GlobalStyle.highlightChange(targ, "red", "both");
            });
            [IMC, MLG, TMB, GET, PGC] = callbackResult[2];
            [IMC, MLG, TMB, GET, PGC].forEach(ind => {
                console.log("number obtained " + ind);
            });
        }
    };
    let _numCol = contextComp[1][0];
    if (typeof _person === "object" &&
        Array.isArray(props) &&
        props.every(prop => typeof prop === "number") &&
        Array.isArray(contextComp) &&
        typeof isAutoFillActive === "boolean" &&
        typeof _numCol === "number") {
        if (inpsWHS.every(inp => inp instanceof HTMLInputElement ||
            inp instanceof HTMLSelectElement ||
            inp instanceof HTMLTextAreaElement)) {
            if (inpsWHS?.length > 0) {
                inpsWHS.forEach(inpWHS => {
                    let event = "change";
                    if (inpWHS instanceof HTMLInputElement ||
                        inpWHS instanceof HTMLTextAreaElement)
                        event = "input";
                    inpWHS?.addEventListener(event, () => {
                        let prop = 0, callbackResult = [
                            numCol || 2,
                            [person.weight || 0, person.height || 0, person.sumDCut || 0],
                            contextComp[1][3] || [0, 0, 0, 0, 0], //[1][3] === arrIndexes
                            contextComp[0][3] || [], //[0][3] === arrTargs
                        ] || defaultResult;
                        if (inpWHS?.classList.contains("inpWeight") ||
                            inpWHS?.classList.contains("inpHeight") ||
                            inpWHS?.classList.contains("inpSumDCut")) {
                            if (inpWHS?.classList.contains("inpWeight"))
                                prop = person.weight;
                            if (inpWHS?.classList.contains("inpHeight"))
                                prop = person.height;
                            if (inpWHS?.classList.contains("inpSumDCut"))
                                prop = person.sumDCut;
                            prop = parseInt(inpWHS.value || "0", 10);
                            [prop, callbackResult] = callbackWHS(person, contextComp, inpWHS, prop, isAutoFillActive);
                        }
                        else if (inpWHS?.classList.contains("selFactorAtletaClass")) {
                            prop = person.sumDCut;
                            [person.sumDCut, callbackResult] = callbackWHS(person, contextComp, inpWHS, person.sumDCut, isAutoFillActive);
                        }
                        else
                            console.error(`Error obtaining classList for inpWHS in addListenerInpsWHS.
            obtained .classList: ${inpWHS?.classList ?? "UNDEFINED CLASS LIST"}`);
                        if (inpWHS?.classList.contains("inpWeight")) {
                            person.weight = prop;
                            fillResult(callbackResult, 0);
                            return [person.weight, callbackResult];
                        }
                        else if (inpWHS?.classList.contains("inpHeight")) {
                            person.height = prop;
                            fillResult(callbackResult, 1);
                            return [person.height, callbackResult];
                        }
                        else if (inpWHS?.classList.contains("inpSumDCut")) {
                            person.sumDCut = prop;
                            fillResult(callbackResult, 2);
                            return [person.sumDCut, callbackResult];
                        }
                        else if (inpWHS?.classList.contains("selFactorAtletaClass")) {
                            fillResult(callbackResult, 2);
                            return [person.sumDCut, callbackResult];
                        }
                        else
                            return [prop, callbackResult];
                    });
                });
            }
            else
                ErrorHandler.elementNotPopulated(inpsWHS, "inpsWHS", extLine(new Error()));
        }
        else
            ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for adding listeners to inpHeights", _person?.height, `${JSON.stringify(inpsWHS)}`);
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for addListenerinpsWHs()", `${JSON.stringify(_person)}`, `${JSON.stringify(contextComp)}`, isAutoFillActive, _numCol);
    return ([
        [
            _numCol || 2,
            [_person.weight || 0, _person.height || 0, _person.sumDCut || 0],
            contextComp[1][3] || [0, 0, 0, 0, 0], //[1][3] === arrIndexes
            contextComp[0][3] || [], //[0][3] === arrTargs
        ],
        inpsWHS,
    ] || [defaultResult, inpsWHS]);
}
export function callbackWHS(person, contextComp, inpWHS, prop = 1, isAutoFillActive = true) {
    numCol = contextComp[1][0];
    let result = [
        numCol || 2,
        [person.weight || 0, person.height || 0, person.sumDCut || 0],
        contextComp[1][3] || [0, 0, 0, 0, 0], //[1][3] === arrIndexes
        contextComp[0][3] || [], //[0][3] === arrTargs
    ] || defaultResult;
    if ((person instanceof Man ||
        person instanceof Woman ||
        person instanceof Neutro) &&
        (inpWHS instanceof HTMLInputElement ||
            inpWHS instanceof HTMLSelectElement ||
            inpWHS instanceof HTMLTextAreaElement) &&
        typeof prop === "number") {
        prop = EdFisNutHandler.validateEvResultNum(inpWHS, prop);
        if (inpWHS?.classList.contains("inpWeight")) {
            person.weight = prop;
            if (isAutoFillActive === true)
                result = exeAutoFill(inpWHS, isAutoFillActive, "col");
            return ([person.weight || 0, result || defaultResult] || [
                person.weight,
                defaultResult,
            ]);
        }
        else if (inpWHS?.classList.contains("inpHeight")) {
            person.height = prop;
            if (isAutoFillActive === true)
                result = exeAutoFill(inpWHS, isAutoFillActive, "col");
            return ([person.height || 0, result || defaultResult] || [
                person.height,
                defaultResult,
            ]);
        }
        else if (inpWHS?.classList.contains("inpSumDCut") ||
            inpWHS?.classList.contains("selFactorAtletaClass")) {
            person.sumDCut = prop;
            if (isAutoFillActive === true)
                result = exeAutoFill(inpWHS, isAutoFillActive, "col");
            return ([person.sumDCut || 0, result || defaultResult] || [
                person.sumDCut,
                defaultResult,
            ]);
        }
        else
            console.warn(`Error validating .classList for inpWHS.
      .classList obtained: ${inpWHS?.classList ?? "UNDEFINED CLASS LIST"}`);
        //sem autofill, dá update somente em prop
    }
    return [prop || 0, result || defaultResult] || [0, defaultResult];
}
export function addListenerAtvLvlElementNaf(_person, contextData) {
    const arrContextEls = [...contextData[1]];
    let _factorAtvLvl = contextData[0][0];
    if ((_person instanceof Man ||
        _person instanceof Woman ||
        _person instanceof Neutro) &&
        typeof _factorAtvLvl === "number" &&
        arrContextEls.every(el => el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) {
        arrContextEls.forEach(el => el?.addEventListener("change", () => {
            [person.atvLvl, factorAtvLvl] = callbackAtvLvlElementNaf(person, contextData, el.id);
            console.log("atvLvl retornado " + person.atvLvl + " e factor " + factorAtvLvl);
            return [person.atvLvl, factorAtvLvl];
        }));
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for addListenerAtvLvlElement()", `${JSON.stringify(_person)}`, factorAtvLvl, `${JSON.stringify(arrContextEls)}`);
    return [_person.atvLvl, _factorAtvLvl];
}
export function callbackAtvLvlElementNaf(person, contextData, mainEl) {
    [factorAtvLvl, IMC] = contextData[0];
    const [atvLvlElement, gordCorpLvl, formTMBTypeElement, nafType] = contextData[1];
    //ajusta par atvLevelElement e nafType + dá update em .atLvl
    if ((person instanceof Man ||
        person instanceof Woman ||
        person instanceof Neutro) &&
        typeof factorAtvLvl === "number" &&
        typeof IMC === "number" &&
        (atvLvlElement instanceof HTMLInputElement ||
            atvLvlElement instanceof HTMLSelectElement) &&
        (gordCorpLvl instanceof HTMLInputElement ||
            gordCorpLvl instanceof HTMLSelectElement) &&
        (formTMBTypeElement instanceof HTMLInputElement ||
            formTMBTypeElement instanceof HTMLSelectElement) &&
        (nafType instanceof HTMLInputElement ||
            nafType instanceof HTMLSelectElement)) {
        //ajusta elementos <select> com base em combinações
        EdFisNutHandler.fluxFormIMC(gordCorpLvl, formTMBTypeElement, IMC || 0);
        if (/LvlAtFis/gi.test(mainEl) ||
            /TMBType/gi.test(mainEl) ||
            /gordCorpLvl/gi.test(mainEl)) {
            EdFisNutHandler.matchTMBElements(atvLvlElement, gordCorpLvl, formTMBTypeElement, document.getElementById("spanFactorAtleta"), document.getElementById("lockGordCorpLvl"), IMC || 0);
            person.atvLvl = EdFisNutHandler.updateAtvLvl(atvLvlElement, nafType, person.atvLvl);
            //retorna factorAtvLvl(número para ser utilizado, com base no .atvLvl)
            const returnedFactorAtvLvl = person.checkAtvLvl(person);
            typeof returnedFactorAtvLvl === "number"
                ? (factorAtvLvl = returnedFactorAtvLvl || 1.4)
                : ErrorHandler.typeError("returnedFactorAtvLvl", returnedFactorAtvLvl, "number", extLine(new Error()));
        }
        else if (/nafType/gi.test(mainEl)) {
            EdFisNutHandler.matchTMBElements(nafType, gordCorpLvl, formTMBTypeElement, document.getElementById("spanFactorAtleta"), document.getElementById("lockGordCorpLvl"), IMC || 0);
            person.atvLvl = EdFisNutHandler.updateAtvLvl(nafType, atvLvlElement, person.atvLvl);
            //retorna factorAtvLvl(número para ser utilizado, com base no .atvLvl)
            const returnedFactorAtvLvl = person.checkAtvLvl(person);
            typeof returnedFactorAtvLvl === "number"
                ? (factorAtvLvl = returnedFactorAtvLvl || 1.4)
                : ErrorHandler.typeError("returnedFactorAtvLvl", returnedFactorAtvLvl, "number", extLine(new Error()));
        }
        else
            console.error(`Error validating mainEl.
      obtained .id: ${mainEl ?? "UNDEFINED ID"}`);
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for callbackAtvLvlElement()", `${JSON.stringify(person)}`, factorAtvLvl, IMC, atvLvlElement, gordCorpLvl, formTMBTypeElement, nafType);
    return [person.atvLvl, factorAtvLvl];
}
export function addListenerProtocolo(protocolo, tabDC, textBodytype) {
    let prVal = protocolo?.value ?? "pollock3";
    if ((protocolo instanceof HTMLSelectElement ||
        protocolo instanceof HTMLInputElement) &&
        tabDC instanceof HTMLTableElement &&
        (textBodytype instanceof HTMLSelectElement ||
            textBodytype instanceof HTMLInputElement))
        protocolo.addEventListener("change", () => {
            protocolo.value = EdFisNutModel.changeTabDCutLayout(protocolo, tabDC, textBodytype);
            return protocolo.value;
        });
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for addListenerProtocolo", protocolo, tabDC, textBodytype);
    return prVal;
}
export function addListenersTabBtnsInps(_person, contextData) {
    const arrBtnsInpsTab = [
        ...Array.from(document.getElementsByClassName("tabBtnImc")),
        ...Array.from(document.getElementsByClassName("tabBtnMlg")),
        ...Array.from(document.getElementsByClassName("tabBtnTmb")),
        ...Array.from(document.getElementsByClassName("tabBtnGet")),
        ...Array.from(document.getElementsByClassName("tabBtnPgc")),
        ...Array.from(document.getElementsByClassName("inpImc")),
        ...Array.from(document.getElementsByClassName("inpMlg")),
        ...Array.from(document.getElementsByClassName("inpTmb")),
        ...Array.from(document.getElementsByClassName("inpGet")),
        ...Array.from(document.getElementsByClassName("inpPgc")),
    ];
    let [_IMC, _MLG, _TMB, _GET, _PGC] = contextData[0][2], [_targInpWeight, _targInpHeight, _targInpIMC, _targInpMLG, _targInpTMB, _targInpGET, _targInpPGC,] = contextData[1][3];
    if ((_person instanceof Man ||
        _person instanceof Woman ||
        _person instanceof Neutro) &&
        contextData[0]
            .flat(1)
            .every(data => typeof data === "number" || typeof data === "string") &&
        arrBtnsInpsTab?.length > 0) {
        arrBtnsInpsTab.forEach(tabEl => {
            if (tabEl instanceof HTMLButtonElement ||
                tabEl instanceof HTMLInputElement ||
                tabEl instanceof HTMLTextAreaElement ||
                tabEl instanceof HTMLSelectElement) {
                let event = "change", context = "BTN";
                if (tabEl instanceof HTMLButtonElement)
                    event = "click";
                if (tabEl instanceof HTMLInputElement ||
                    tabEl instanceof HTMLTextAreaElement)
                    event = "input";
                tabEl.addEventListener(event, () => {
                    if (tabEl instanceof HTMLInputElement ||
                        tabEl instanceof HTMLTextAreaElement) {
                        if (tabEl.classList.contains("inpImc"))
                            context = "IMC";
                        if (tabEl.classList.contains("inpMlg"))
                            context = "MLG";
                        if (tabEl.classList.contains("inpTmb"))
                            context = "TMB";
                        if (tabEl.classList.contains("inpGet"))
                            context = "GET";
                        if (tabEl.classList.contains("inpPgc"))
                            context = "PGC";
                    }
                    const callbackResult = callbackTabBtnsInps(person, tabEl, [
                        [factorAtvLvl, factorAtleta, [IMC, MLG, TMB, GET, PGC]],
                        [
                            consTablesFs,
                            gordCorpLvl,
                            formTMBTypeElement,
                            [
                                targInpWeight,
                                targInpHeight,
                                targInpIMC,
                                targInpMLG,
                                targInpTMB,
                                targInpGET,
                                targInpPGC,
                            ],
                        ],
                    ], context);
                    if (context === "BTN" || isAutoFillActive === true) {
                        [
                            [person.weight, person.height],
                            [IMC, MLG, TMB, GET, PGC],
                            [
                                targInpWeight,
                                targInpHeight,
                                targInpIMC,
                                targInpMLG,
                                targInpTMB,
                                targInpGET,
                                targInpPGC,
                            ],
                        ] = callbackResult;
                    }
                    else {
                        console.log(event);
                        console.log("ELSE");
                        switch (context) {
                            case "BTN":
                                break;
                            case "IMC":
                                IMC = checkReturnIndex(callbackResult[2][2], callbackResult[1][0], context);
                                break;
                            case "MLG":
                                MLG = checkReturnIndex(callbackResult[2][3], callbackResult[1][1], context);
                                break;
                            case "TMB":
                                TMB = checkReturnIndex(callbackResult[2][4], callbackResult[1][2], context);
                                break;
                            case "GET":
                                GET = checkReturnIndex(callbackResult[2][5], callbackResult[1][3], context);
                                break;
                            case "PGC":
                                PGC = checkReturnIndex(callbackResult[2][6], callbackResult[1][4], context);
                                break;
                            default:
                                ErrorHandler.stringError("value for callbackTabBtnsInps() context", context, extLine(new Error()));
                        }
                    }
                    return ([
                        [person?.weight || 0, person?.height || 0],
                        [IMC || 0, MLG || 0, TMB || 0, GET || 0, PGC || 0] || [
                            0, 0, 0, 0, 0,
                        ],
                        [
                            targInpWeight,
                            targInpHeight,
                            targInpIMC,
                            targInpMLG,
                            targInpTMB,
                            targInpGET,
                            targInpPGC,
                        ] || [],
                    ] || [[0, 0], [0, 0, 0, 0, 0], []]);
                });
            }
            else
                ErrorHandler.elementNotFound(tabEl, `instance of tabEl id ${tabEl?.id}`, extLine(new Error()));
        });
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for addListenerTabBtns()", `${JSON.stringify(_person)}`, `${JSON.stringify(contextData)}`, `${JSON.stringify(arrBtnsInpsTab)}`);
    return ([
        [_person?.weight || 0, _person?.height || 0],
        [_IMC || 0, _MLG || 0, _TMB || 0, _GET || 0, _PGC || 0] || [
            0, 0, 0, 0, 0,
        ],
        [
            _targInpWeight,
            _targInpHeight,
            _targInpIMC,
            _targInpMLG,
            _targInpTMB,
            _targInpGET,
            _targInpPGC,
        ] || [],
    ] || [[0, 0], [0, 0, 0, 0, 0], []]);
}
export function callbackTabBtnsInps(person, tabEl, contextData, context = "BTN") {
    [factorAtvLvl, factorAtleta, [IMC, MLG, TMB, GET, PGC]] = contextData[0];
    [
        targInpWeight,
        targInpHeight,
        targInpIMC,
        targInpMLG,
        targInpTMB,
        targInpGET,
        targInpPGC,
    ] = contextData[1][3];
    const [consTablesFs, gordCorpLvl, formTMBTypeElement] = contextData[1];
    if ((person instanceof Man ||
        person instanceof Woman ||
        person instanceof Neutro) &&
        (tabEl instanceof HTMLButtonElement ||
            (tabEl instanceof HTMLInputElement &&
                (tabEl.type === "number" || tabEl.type === "text")))) {
        numCol = EdFisNutHandler.getNumCol(tabEl) ?? 0;
        if (typeof numCol === "number" &&
            numCol > 0 &&
            typeof factorAtvLvl === "number" &&
            typeof factorAtleta === "string" &&
            consTablesFs instanceof HTMLElement &&
            (gordCorpLvl instanceof HTMLSelectElement ||
                gordCorpLvl instanceof HTMLInputElement) &&
            (formTMBTypeElement instanceof HTMLSelectElement ||
                formTMBTypeElement instanceof HTMLInputElement)) {
            console.log("AUTOFILL IN CALLBACK " + isAutoFillActive);
            if (isAutoFillActive) {
                [
                    targInpWeight,
                    targInpHeight,
                    targInpIMC,
                    targInpMLG,
                    targInpTMB,
                    targInpGET,
                ] = EdFisNutHandler.defineTargInps(consTablesFs, numCol, "col");
                targInpPGC = document.querySelector(`#inpPgc${numCol - 1}Cel4_${numCol}`);
                [PGC, , targInpPGC] = EdFisNutHandler.updatePGC(person, consTablesFs, numCol, "col");
            }
            if (typeof context === "string") {
                switch (context) {
                    case "BTN":
                        break;
                    case "IMC":
                        IMC = checkReturnIndex(targInpIMC, IMC, "IMC");
                        break;
                    case "MLG":
                        MLG = checkReturnIndex(targInpMLG, MLG, "MLG");
                        break;
                    case "TMB":
                        TMB = checkReturnIndex(targInpTMB, TMB, "TMB");
                        break;
                    case "GET":
                        GET = checkReturnIndex(targInpGET, GET, "GET");
                        break;
                    case "PGC":
                        PGC = checkReturnIndex(targInpPGC, PGC, "PGC");
                        break;
                    default:
                        ErrorHandler.stringError("value for callbackTabBtnsInps() context", context, extLine(new Error()));
                }
                if (context === "BTN" || isAutoFillActive === true) {
                    [person.weight, person.height] =
                        EdFisNutHandler.matchPersonPropertiesWH(person, targInpWeight, targInpHeight);
                    console.log("weight capturado " + person.weight);
                    console.log("height capturado " + person.height);
                    [IMC, MLG, TMB, GET] = EdFisNutHandler.updateIndexesContexts(person, [gordCorpLvl, targInpIMC, targInpMLG], [targInpTMB, targInpGET, formTMBTypeElement], factorAtvLvl, factorAtleta);
                    console.log(`índices capturados: ${JSON.stringify([IMC, MLG, TMB, GET])}`);
                }
            }
            else
                ErrorHandler.typeError("argument for context in callbackTabBtnsInps()", context, "string", extLine(new Error()));
        }
        else
            ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for validating data in callbackTabBtns()", numCol, factorAtvLvl, factorAtleta, consTablesFs, gordCorpLvl, formTMBTypeElement);
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for callbackTabBtns()", `${JSON.stringify(person)}`, tabEl);
    return ([
        [person?.weight || 0, person?.height || 0],
        [IMC || 0, MLG || 0, TMB || 0, GET || 0, PGC || 0] || [0, 0, 0, 0, 0],
        [
            targInpWeight,
            targInpHeight,
            targInpIMC,
            targInpMLG,
            targInpTMB,
            targInpGET,
            targInpPGC,
        ] || [],
    ] || [[0, 0], [0, 0, 0, 0, 0], []]);
}
export function checkReturnIndex(targInp, prop = 0, context) {
    if ((targInp instanceof HTMLInputElement ||
        targInp instanceof HTMLTextAreaElement ||
        targInp instanceof HTMLSelectElement) &&
        typeof context === "string" &&
        typeof prop === "number") {
        const returnedProp = GlobalHandler.updateSimpleProperty(targInp) ?? 0;
        typeof returnedProp === "number"
            ? (prop = parseFloat(returnedProp.toFixed(4)))
            : ErrorHandler.typeError("update de prop", returnedProp, "number", extLine(new Error()));
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for checkReturnIndex", targInp, context, prop);
    return prop || 0;
}
//inicialização de constantes repetitivas nas argumentações a partir de procura no DOM
const selFactorAtleta = document.getElementById("selFactorAtleta");
const consTablesFs = document.getElementById("fsProgConsId");
const textBodytype = document.getElementById("textBodytype");
const protocolo = document.getElementById("tabSelectDCutId");
const tabDC = document.getElementById("tabDCut");
const genElement = document.getElementById("genId");
const genBirthRel = document.getElementById("genBirthRelId");
const genFisAlin = document.getElementById("genFisAlinId");
const areAllGenContChecked = GlobalModel.checkAllGenConts(genElement, genBirthRel, document.getElementById("genTransId"), genFisAlin);
const gordCorpLvl = document.getElementById("gordCorpLvl");
const formTMBTypeElement = document.getElementById("formCalcTMBType");
const atvLvlElement = document.getElementById("selectLvlAtFis");
const nafType = document.getElementById("nafType");
const defaultResult = [0, [0, 0, 0], [0, 0, 0, 0, 0], []];
//inicialização de states
let person = {
    gen: genElement?.value ?? "masculino",
    age: parseInt(document.getElementById("dateAgeId")?.value ?? "0") || 0,
    sumDCut: 0,
    weight: 0,
    height: 0,
    atvLvl: atvLvlElement?.value ?? "leve",
}, isAutocorrectOn = true, firstClick = true, isAutoFillActive = true, numTotalColsCons = consTablesFs?.querySelectorAll("col")?.length || 0, numTotalTabsCons = consTablesFs?.querySelectorAll("table")?.length || 0, numColsCons = 1, areColGroupsSimilar = false, numCons = 1, numConsLastOp = 1, areNumConsOpsValid = false, 
// numTotalTitledColsCons = 0,
numCol = 2, factorAtvLvl = 1.4, factorAtleta = "Peso", 
//
[targInpWeight, targInpHeight, targInpIMC, targInpMLG, targInpTMB, targInpSumDCut, targInpGET, targInpPGC,] = validateTitlesForTargs(numCons), IMC = parseFloat(parseFloat(targInpIMC?.value || "0").toFixed(4)) ||
    0, MLG = parseFloat(parseFloat(targInpMLG?.value || "0").toFixed(4)) ||
    0, TMB = parseFloat(parseFloat(targInpTMB?.value || "0").toFixed(4)) ||
    0, GET = parseFloat(parseFloat(targInpGET?.value || "0").toFixed(4)) ||
    0, PGC = parseFloat(parseFloat(targInpPGC?.value || "0").toFixed(4)) ||
    0, rowCountAtivFisRot = 3, rowCountAtivFisProp = 3, rowCountComorb = 3, genValue = genElement?.value || "masculino";
[isAutocorrectOn, firstClick] = GlobalControl.getGlobalEls(isAutocorrectOn, firstClick, "num");
GlobalControl.addListenerExportBtn("edFisNut");
GlobalStyle.dinamicGridAdjust(Array.from(document.querySelectorAll(".fsAnamGDiv")));
GlobalStyle.showTips();
//início da validação de elementos no DOM e inserção de listeners com callbacks respectivos
selFactorAtleta instanceof HTMLSelectElement
    ? (factorAtleta = selFactorAtleta.value)
    : ErrorHandler.elementNotFound(selFactorAtleta, "selFactorAtleta", extLine(new Error()));
//chamadas
[rowCountComorb] = addListenerComorbBtns(rowCountComorb);
[rowCountAtivFisRot, rowCountAtivFisProp] = addListenerAtivFisContBtns(rowCountAtivFisRot, rowCountAtivFisProp);
[numColsCons, areColGroupsSimilar] = addListenerInnerTabs(consTablesFs, numColsCons, areColGroupsSimilar);
[numCons, numConsLastOp, areNumConsOpsValid] = addListenerNumCons([document.getElementById("selectNumCons"), consTablesFs, tabDC], [numColsCons, numCons, numConsLastOp], areNumConsOpsValid);
[
    targInpWeight,
    targInpHeight,
    targInpIMC,
    targInpMLG,
    targInpTMB,
    targInpGET,
    targInpSumDCut,
    targInpPGC,
] = validateTitlesForTargs(numCons);
addListenerTrioReadNumCons(consTablesFs, numTotalColsCons, numTotalTabsCons);
[isAutoFillActive] = addListenerAutoFillBtn();
protocolo instanceof HTMLSelectElement || protocolo instanceof HTMLInputElement
    ? (protocolo.value = addListenerProtocolo(protocolo, tabDC, textBodytype))
    : ErrorHandler.elementNotFound(protocolo, "instance for protocolo", extLine(new Error()));
if (genElement instanceof HTMLSelectElement ||
    genElement instanceof HTMLInputElement) {
    genElement.value = addListenersGenContsEF(person, genElement);
    genFisAlin instanceof HTMLSelectElement ||
        genFisAlin instanceof HTMLInputElement
        ? ([person.gen, genElement.value, genFisAlin.value] = addListenerTextBodyEl(person, [textBodytype, protocolo, tabDC, genElement, genBirthRel, genFisAlin], areAllGenContChecked))
        : ErrorHandler.multipleElementsNotFound(extLine(new Error()), "gender containers for classifying person", genElement, genFisAlin);
    // person.gen = addListenersGenContsEF(person, genElement);
    if (person && Object.keys(person).length === 6) {
        person = GlobalModel.generatePersonInstance(person);
        console.log(`INITIAL PERSON INSTANCED ${JSON.stringify(person) || null}; 
             Instance ${Object.prototype.toString.call(person).slice(8, -1)}`);
        if (person instanceof Man ||
            person instanceof Woman ||
            person instanceof Neutro) {
            [person.age] = addListenerAgeElement(person, [
                [
                    gordCorpLvl,
                    formTMBTypeElement,
                    nafType,
                    [
                        targInpWeight,
                        targInpHeight,
                        targInpIMC,
                        targInpMLG,
                        targInpTMB,
                        targInpGET,
                        targInpSumDCut,
                        targInpPGC,
                    ],
                ],
                [numCons, factorAtvLvl, factorAtleta, [IMC, MLG, TMB, GET, PGC]],
            ]);
            [person.sumDCut, PGC] = addListenersSumDCutBtns(person, [tabDC, protocolo, [targInpSumDCut, targInpPGC]], isAutoFillActive, PGC);
            [
                [
                    numCol,
                    [person.weight, person.height, person.sumDCut],
                    [IMC, MLG, TMB, GET, PGC],
                    [
                        targInpWeight,
                        targInpHeight,
                        targInpIMC,
                        targInpMLG,
                        targInpTMB,
                        targInpGET,
                        targInpSumDCut,
                        targInpPGC,
                        ,
                    ],
                ],
            ] = addListenerInpsWHS(person, [
                [
                    gordCorpLvl,
                    formTMBTypeElement,
                    nafType,
                    [
                        targInpWeight,
                        targInpHeight,
                        targInpIMC,
                        targInpMLG,
                        targInpTMB,
                        targInpGET,
                        targInpSumDCut,
                        targInpPGC,
                    ],
                ],
                [numCol, factorAtvLvl, factorAtleta, [IMC, MLG, TMB, GET, PGC]],
            ], isAutoFillActive);
            [person.atvLvl, factorAtvLvl] = addListenerAtvLvlElementNaf(person, [
                [factorAtvLvl, IMC],
                [atvLvlElement, gordCorpLvl, formTMBTypeElement, nafType],
            ]);
            [
                [person.weight, person.height],
                [IMC, MLG, TMB, GET, PGC],
                [
                    targInpWeight,
                    targInpHeight,
                    targInpIMC,
                    targInpMLG,
                    targInpTMB,
                    targInpGET,
                    targInpPGC,
                ],
            ] = addListenersTabBtnsInps(person, [
                [factorAtvLvl, factorAtleta, [IMC, MLG, TMB, GET, PGC]],
                [
                    consTablesFs,
                    gordCorpLvl,
                    formTMBTypeElement,
                    [
                        targInpWeight,
                        targInpHeight,
                        targInpIMC,
                        targInpMLG,
                        targInpTMB,
                        targInpGET,
                        targInpPGC,
                    ],
                ],
            ]);
        }
        else
            console.error(`Error validating class for person. Obtained class: ${Object.prototype.toString
                .call(person)
                .slice(-7, -1)}`);
    }
    else
        ErrorHandler.objectError("generating instance for person", person, "person", "6", extLine(new Error()));
}
else
    ErrorHandler.elementNotFound(genElement, "genElement in DOM initialization", extLine(new Error()));
//função impura por enquanto
export function exeAutoFill(targ, isAutoFillActive = true, context = "cons") {
    let numRef = 1, arrIndexes = [], arrtargInps = [];
    if ((targ instanceof HTMLInputElement ||
        targ instanceof HTMLTextAreaElement ||
        targ instanceof HTMLSelectElement) &&
        isAutoFillActive === true &&
        (person instanceof Man ||
            person instanceof Woman ||
            person instanceof Neutro) &&
        typeof context === "string") {
        if (context === "cons") {
            const selectNumCons = document.getElementById("selectNumCons");
            selectNumCons instanceof HTMLInputElement ||
                selectNumCons instanceof HTMLSelectElement
                ? (numCons = parseInt(selectNumCons?.value || "1"))
                : ErrorHandler.inputNotFound(selectNumCons, "selectNumCons in exeAutoFill()", extLine(new Error()));
            numRef = numCons;
        }
        else if (context === "col") {
            numCol = EdFisNutHandler.getNumCol(targ) || 2;
            console.log("NUMCOL IN AUTOFILL " + numCol);
            numRef = numCol;
        }
        else
            console.warn(`defaulted numRef`);
        arrtargInps = EdFisNutHandler.defineTargInps(consTablesFs, numRef, context);
        [
            targInpWeight,
            targInpHeight,
            targInpIMC,
            targInpMLG,
            targInpTMB,
            targInpGET,
        ] = arrtargInps;
        arrIndexes = EdFisNutHandler.updateIndexesContexts(person, [gordCorpLvl, targInpIMC, targInpMLG], [targInpTMB, targInpGET, formTMBTypeElement], factorAtvLvl, factorAtleta);
        [IMC, MLG, TMB, GET] = arrIndexes;
        console.log("IMC capturado " + IMC);
        console.log("MLG caputrado " + MLG);
        console.log("TMB capturado " + TMB);
        console.log("GET capturado " + GET);
        [person.weight, person.height] = EdFisNutHandler.matchPersonPropertiesWH(person, targInpWeight, targInpHeight);
        console.log("weight capturado " + person.weight);
        console.log("height capturado " + person.height);
        const arrPGC = EdFisNutHandler.updatePGC(person, consTablesFs, numRef, context);
        //PGC, targInpSumDCut, targInpPGC
        [PGC, targInpSumDCut, targInpPGC] = arrPGC;
        console.log("PGC capturado " + PGC);
        arrIndexes.push(PGC);
        arrtargInps.push(targInpSumDCut, targInpPGC);
        person.sumDCut = EdFisNutHandler.matchPersonPropertiesDC(person, arrPGC[1]);
        console.log("sumDCut capturado" + person.sumDCut);
        if (arrtargInps.every(targ => targ instanceof HTMLInputElement ||
            targ instanceof HTMLSelectElement ||
            targ instanceof HTMLTextAreaElement)) {
            targInpIMC.value = IMC.toString();
            targInpMLG.value = MLG.toString();
            targInpTMB.value = TMB.toString();
            targInpGET.value = GET.toString();
            targInpPGC.value = PGC.toString();
        }
        else
            console.error(`Error validating instances of arrtargInps in exeAutoFill(). Values for respective <input> Elements not updated.`);
        return ([
            numRef || 1,
            [person.weight || 0, person.height || 0, person.sumDCut || 0],
            arrIndexes || [0, 0, 0, 0, 0],
            arrtargInps || [],
        ] || [1, [0, 0, 0], [0, 0, 0, 0, 0], []]);
    }
    else {
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for exeAutoFill", targ, isAutoFillActive, `${JSON.stringify(person)}`, context);
        arrIndexes = [IMC, MLG, TMB, GET, PGC];
        arrtargInps = [
            targInpWeight,
            targInpHeight,
            targInpIMC,
            targInpMLG,
            targInpTMB,
            targInpGET,
            targInpSumDCut,
            targInpPGC,
        ];
    }
    return ([
        numRef || 1,
        [person.weight || 0, person.height || 0, person.sumDCut || 0],
        arrIndexes || [0, 0, 0, 0, 0],
        arrtargInps || [],
    ] || [1, [0, 0, 0], [0, 0, 0, 0, 0], []]);
}
