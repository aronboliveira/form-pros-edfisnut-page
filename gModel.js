//nesse file estão presentes principalmente as funções relacionadas à exigência de modelo textual e de visualização
import * as GlobalHandler from "./gHandlers.js";
import * as GlobalStyle from "./gStyleScript.js";
import { Man, Woman, Neutro } from "./classes.js";
import * as ErrorHandler from "./errorHandler.js";
import { extLine } from "./errorHandler.js";
// import React from 'react';
export function numberLimit(inpEl) {
    if (inpEl instanceof HTMLInputElement ||
        inpEl instanceof HTMLTextAreaElement ||
        inpEl instanceof HTMLSelectElement) {
        const isAtivFis = inpEl.classList.contains("inpAtivFis");
        const isAlimRot = inpEl.classList.contains("inpAlimRot");
        const isDDD = inpEl.classList.contains("inpDDD");
        const isFreq = inpEl.classList.contains("freqInpList");
        if ((isAtivFis ||
            isAlimRot ||
            inpEl.classList.contains("inpLocNum") ||
            isDDD ||
            isFreq) &&
            !inpEl.classList.contains("float")) {
            if (inpEl.value?.match(/[=.,;~/|"!@#$%&*¬°ªº§¹²³£¢(){}[\]]/g)) {
                const wrongMatchIndex = inpEl.value.indexOf(inpEl.value.match(/[=.,;~/|"!@#$%&*¬°ªº§¹²³£¢(){}[\]]/g)?.[0] ?? "");
                inpEl.value =
                    inpEl.value.slice(0, wrongMatchIndex ?? 0) +
                        inpEl.value.slice(wrongMatchIndex + 1 ?? 0);
            }
            if (parseInt(inpEl.value) < 1 && inpEl.id?.endsWith("Max")) {
                const inpValueArray = Array.from(inpEl.value);
                inpValueArray?.splice(0, 1, "1");
                inpEl.value = inpValueArray?.toString();
            }
            if ((isAtivFis || isAlimRot || isDDD || isFreq) &&
                inpEl.value?.length > 2)
                inpEl.value = inpEl.value.slice(0, 2);
        }
    }
    else
        ErrorHandler.elementNotFound(inpEl, `inpEl id ${inpEl?.id ?? "UNDEFINED ID"} in numberLimit`, extLine(new Error()));
}
export function normalizeNegatives(tabInp) {
    let parsedInpValue = 0;
    if (tabInp instanceof HTMLInputElement) {
        parsedInpValue = parseFloat(tabInp.value);
        if (Number.isNaN(parsedInpValue) || parsedInpValue < 0) {
            parsedInpValue = 0;
        }
    }
    else
        ErrorHandler.inputNotFound(tabInp, "tabInp", extLine(new Error()));
    return parsedInpValue.toString() ?? "";
}
export function parseNotNaN(iniVal, def = 0, context = "int", fixed = 4) {
    let returnVal = 0;
    if (typeof iniVal === `string` &&
        typeof context === `string` &&
        typeof def === `number` &&
        typeof fixed === `number`) {
        switch (context) {
            case "int":
                returnVal = parseInt(iniVal, 10) || def;
                if (Number.isNaN(returnVal) || isNaN(returnVal))
                    returnVal = def;
                break;
            case "float":
                returnVal = parseFloat(parseFloat(iniVal).toFixed(fixed)) || def;
                if (Number.isNaN(returnVal) || isNaN(returnVal))
                    returnVal = def;
                break;
            default:
                ErrorHandler.stringError("argumento de contexto", "context", extLine(new Error()));
        }
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), `argumentos para parseNotNaN`, iniVal, context, def);
    return returnVal || 0;
}
export function correctCursorNextWords(isCursorAutoMoved = false, isUndoUppercase = false, match = "", textElement) {
    let text = textElement.value || textElement.textContent || null;
    let isFixAfterDCursorExec = false;
    if (isFixAfterDCursorExec)
        return;
    const selectionPosition = window.getSelection()?.getRangeAt(0).startOffset;
    text = wrongStartCorrection(text, match);
    textElement.addEventListener("keyup", fixmove => {
        const keyboardEvent = fixmove;
        if (selectionPosition === 0 || selectionPosition === text?.length || 0) {
            if (keyboardEvent.key === " " ||
                keyboardEvent.key === "Backspace" ||
                (keyboardEvent.key >= "ArrowLeft" &&
                    keyboardEvent.key <= "ArrowDown") ||
                (keyboardEvent.key >= "a" && keyboardEvent.key <= "z") ||
                (keyboardEvent.key >= "A" && keyboardEvent.key <= "Z") ||
                isUndoUppercase) {
                if (!isFixAfterDCursorExec)
                    isCursorAutoMoved = moveCursorToTheEnd(isCursorAutoMoved, textElement);
                keyboardEvent.preventDefault();
                isFixAfterDCursorExec = true;
            }
        }
    });
    return [text, isCursorAutoMoved];
}
export function wrongStartCorrection(text = "", wrongStartMatch = "") {
    let fixedText = text;
    if (wrongStartMatch && text) {
        const wrongStartLength = wrongStartMatch
            .toString()
            .replaceAll(",", "").length;
        fixedText =
            text.slice(wrongStartLength - 1) + text.slice(0, wrongStartLength - 1);
    }
    return fixedText;
}
export function moveCursorToTheEnd(isCursorAutoMoved = false, textElement) {
    if (window.getSelection && !isCursorAutoMoved) {
        const range = document.createRange();
        range.selectNodeContents(textElement);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        isCursorAutoMoved = true;
    }
    else
        isCursorAutoMoved = false;
    return isCursorAutoMoved;
}
export function fixCursorPosition(textElement, range, selection, shouldSetEnd = false) {
    range.setStart(textElement, 0);
    if (shouldSetEnd === true)
        range.setEnd(textElement, 1);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
}
export function fixFirstLetter(fstLet = "", regex, textElement, range, selection, shouldSetEnd = false) {
    let contText = textElement.value || textElement.textContent || "";
    const firstLetterMatch = fstLet?.match(regex);
    if (firstLetterMatch) {
        contText = fstLet?.toUpperCase() + contText.substring(1).toLowerCase();
        if (range.endOffset >= 1)
            fixCursorPosition(textElement, range, selection, shouldSetEnd);
    }
    return contText;
}
export function fixWrongStarts(text = "", match = "", length = 0) {
    let fixedStr = text ?? "";
    if (text && match) {
        const arrText = Array.from(text);
        arrText.splice(text.indexOf(match), length, "");
        fixedStr = arrText.toString().replaceAll(",", "");
    }
    return fixedStr;
}
export function fixNextWordsIniNotD(remadeText = "", letMatch = "") {
    if (remadeText) {
        const gLetMatchI = remadeText.lastIndexOf(letMatch) + 1;
        const capChar = remadeText.charAt(gLetMatchI)?.toUpperCase();
        const arrText = Array.from(remadeText);
        arrText[gLetMatchI] = capChar;
        remadeText = arrText.toString().replaceAll(",", "");
        if (remadeText.match(/^\s[\w]+/g))
            remadeText = remadeText.slice(1, remadeText.length) + " ";
    }
    else
        remadeText = "";
    return remadeText;
}
export function fixNextWordsAfterD(remadeText = "", letMatch = "") {
    const globalLetterMatchIndexD = remadeText
        ? remadeText.lastIndexOf(letMatch) + 1
        : undefined;
    if (globalLetterMatchIndexD) {
        const actualCharD = remadeText?.charAt(globalLetterMatchIndexD);
        const capitalizedCharD = actualCharD?.toUpperCase();
        if (remadeText && capitalizedCharD) {
            const citeTextArrayD = Array.from(remadeText);
            citeTextArrayD[globalLetterMatchIndexD] = capitalizedCharD;
            remadeText = citeTextArrayD.toString().replaceAll(",", "");
        }
    }
    return remadeText;
}
export function fixUnproperUppercases(text = "", match = "", context = 0) {
    const spaceMatches = text.match(/\s/g);
    const upperCasesRepetitionsIndex = text.indexOf(match);
    const textBeforeRepetitions = text.substring(0, upperCasesRepetitionsIndex);
    let addAcumulator = 0, loweredRepetitions = "";
    loweredRepetitions = match.toLowerCase().slice(1);
    if (spaceMatches) {
        if (context === "NoD" ||
            context === "YesDCont" ||
            context == 0 ||
            context === 2 ||
            !context) {
            if (context === "YesDCont" || context === 2) {
                const lowercasesMatches = text.match(/[a-záàâäãéèêëíìîïóòôöõúùûü]/g);
                if (lowercasesMatches)
                    addAcumulator += lowercasesMatches.length;
            }
            addAcumulator += spaceMatches.length;
        }
        else if (context === "YesDVal" || context === 1)
            addAcumulator = 1;
        else
            console.error(`Context value not suitable`);
    }
    const textAfterRepetitions = text.slice(upperCasesRepetitionsIndex + 1 + loweredRepetitions.length - addAcumulator, text.length + 1);
    const textArray = Array.from(text);
    textArray.splice(upperCasesRepetitionsIndex + 1, loweredRepetitions.length, loweredRepetitions);
    if (context === "NoD" || context == 0 || !context)
        text =
            textBeforeRepetitions +
                match.slice(0, 1) +
                loweredRepetitions +
                textAfterRepetitions;
    else if (context === "YesDVal") {
        const upperlowercombD = text.match(/D[a-záàâäãéèêëíìîïóòôöõúùûü][sS]?[\s]/);
        if (upperlowercombD?.length === 4)
            loweredRepetitions += upperlowercombD.toString().replace(/S/, "s");
        text = textBeforeRepetitions + loweredRepetitions + textAfterRepetitions;
    }
    else if (context === "YesDCont") {
        text = text.match(/D[aeiouáàâäãéèêëíìîïóòôöõúùûü][s]\s[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]{3,}/)
            ? textBeforeRepetitions + loweredRepetitions + "S" + textAfterRepetitions
            : textBeforeRepetitions + loweredRepetitions + textAfterRepetitions;
    }
    else
        console.error(`Context value not suitable`);
    return text;
}
export function fixForcedUpperCase(textElement, wordMatch = [""], wMatchIteration = "") {
    let text = textElement.value || textElement.textContent || "";
    const strDlowercase = wMatchIteration.toString();
    const DUppercased = strDlowercase.charAt(1).toUpperCase();
    if (DUppercased) {
        const strDAfterMinusInd = (text?.length ?? 0) -
            (strDlowercase.substring(0, 1) + DUppercased + strDlowercase.substring(2))
                .length;
        const startSlicedCite = text?.slice(0, strDAfterMinusInd);
        if (wordMatch.length >= 1 && startSlicedCite)
            text = startSlicedCite + text?.slice(strDAfterMinusInd);
    }
    return text;
}
export function autoCapitalizeInputs(textEl, isAutocorrectOn = true) {
    if ((textEl instanceof HTMLInputElement && textEl.type === "text") ||
        textEl instanceof HTMLTextAreaElement) {
        let text = textEl?.value ?? null;
        if (isAutocorrectOn && text) {
            //inicialização de expressões regex com seus objetos e matches associados
            const newWordMatches = text.match(/\s[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]?[a-zA-ZáàâäãéèêëíìîïóòôöõúùûüÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]+\s?[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]?[a-zA-ZáàâäãéèêëíìîïóòôöõúùûüÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]*/g);
            const letterMatchesIniNotD = text.match(/\s[^d]/g);
            const letterMatchesIniD = text.match(/\sd/g);
            let letterNotMatchesAfterD = text.match(/\sd[aeioáàâäãéèêëíìîïóòôöõúùûüAEIOÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][sS]?\s/g) ?? [];
            const letterMatchesAfterDOp1 = text.match(/\sd[^aeioáàâäãéèêëíìîïóòôöõúùûüAEIOÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]/g);
            const letterMatchesAfterDOp2 = text.match(/\sd[aeioáàâäãéèêëíìîïóòôöõúùûüAEIOÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][^sS\s]/g);
            const letterMatchesAfterDOp3 = text.match(/\sd[aeioáàâäãéèêëíìîïóòôöõúùûüAEIOÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][sS][a-zA-ZáàâäãéèêëíìîïóòôöõúùûüÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]/g);
            const lowercasesRegexObj = new RegExp(/[a-záàâäãéèêëíìîïóòôöõúùûü]/g);
            const uppercasesRegexObj = new RegExp(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]/);
            const multipleUppercasesMatches = text.match(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]{2,}/g);
            const multipleUppercasesMatches2 = text.match(/D[a-záàâäãéèêëíìîïóòôöõúùûü][S]\s/g);
            const wrongUppercasesMatchesOp1 = text.match(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]\b/g);
            const wrongUppercasesMatchesOp2 = text.match(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+\b/g);
            const wrongUppercasesMatchesOp3 = text.match(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]+[a-záàâäãéèêëíìîïóòôöõúùûü]{2,3}\b/g);
            const wrongUppercasesMatchesOp4 = text.match(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü][A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+\b/g);
            const wrongUppercasesMatchesOp5 = text.match(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]{1,2}[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+[a-záàâäãéèêëíìîïóòôöõúùûüA-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]+\b/g);
            const wrongUppercasesMatchesOp6 = text.match(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+[a-záàâäãéèêëíìîïóòôöõúùûü]+[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]+[a-záàâäãéèêëíìîïóòôöõúùûü][a-záàâäãéèêëíìîïóòôöõúùûü]+\b/g);
            const wrongUppercasesMatchesOp7 = text.match(/D[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][sS]/g);
            const wrongUppercasesMatchesOp8 = text.match(/D[AEIOÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][^sS]/g);
            const wrongUppercasesMatchesOp9 = text.match(/D[aeioáàâäãéèêëíìîïóòôöõúùûüAEIOÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][sS]\s/g);
            const wrongStartMatch = text
                .match(/^[a-záàâäãéèêëíìîïóòôöõúùûü]+[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]/)
                ?.toString() ?? null;
            const wrongCharsRegexOp1 = /[\s]*[\d\n,;.+\-=~\\/|"!@#$%&*¬°ªº§¹²³£¢(){}[\]]+[\s]*[\d\n,;.+\-=~\\/|"!@#$%&*¬°ªº§¹²³£¢(){}[\]]*/g;
            const wrongCharsMatchesOp1 = text.match(wrongCharsRegexOp1);
            const wrongCharsRegexOp2 = /$[\d\n,;.+\-=~\\/|"!@#$%&*¬°ªº§¹²³£¢(){}[\]]+/g;
            const wrongCharsMatchesOp2 = text.match(wrongCharsRegexOp2);
            const wrongCharsRegexOp3 = /(?<=\sdD)[\d\n,;.+\-=~\\/|"!@#$%&*¬°ªº§¹²³£¢(){}[\]]+/g;
            const wrongCharsMatchesOp3 = text.match(wrongCharsRegexOp3);
            //inicialização de outras variáveis
            const selection = window.getSelection();
            const range = document.createRange();
            let remadeText = text;
            let isUndoUppercase = false;
            let isCursorAutoMoved = false;
            if (text.length === 1 && !newWordMatches)
                textEl.value = fixFirstLetter(text[0], /\b\w/, textEl, range, selection, false);
            else if (text.length > 1 &&
                !textEl.classList.contains("autocorrectFirst")) {
                if (textEl.classList.contains("inpAst") ||
                    textEl.classList.contains("inpIdentif")) {
                    //IIFE para encapsular correção de inícios incorretos de entrada
                    (() => {
                        if (wrongCharsMatchesOp1 ||
                            wrongCharsMatchesOp2 ||
                            wrongCharsMatchesOp3) {
                            const wrongCharsMatches = [
                                ...(wrongCharsMatchesOp1 || []),
                                ...(wrongCharsMatchesOp2 || []),
                                ...(wrongCharsMatchesOp3 || []),
                            ];
                            for (let iW = 0; iW < wrongCharsMatches.length; iW++) {
                                wrongCharsMatches.forEach(wrongCharMatch => {
                                    textEl.value = fixWrongStarts(text, wrongCharMatch, wrongCharsMatches[iW].length);
                                    [textEl.value, isCursorAutoMoved] = correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, textEl);
                                });
                            }
                        }
                    })();
                    if (wrongStartMatch)
                        textEl.value =
                            wrongStartCorrection(textEl.value, wrongStartMatch) ?? "";
                    if (newWordMatches) {
                        newWordMatches.forEach(() => {
                            //IIFE para capitalizar palavras após a primeira
                            (() => {
                                if (letterMatchesIniNotD && !letterMatchesIniD) {
                                    letterMatchesIniNotD.forEach(letterMatch => {
                                        remadeText = fixNextWordsIniNotD(remadeText, letterMatch);
                                    });
                                    textEl.value = remadeText;
                                    [textEl.value, isCursorAutoMoved] = correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, textEl);
                                    textEl.value =
                                        wrongStartCorrection(textEl.value, wrongStartMatch) ?? "";
                                }
                                else if ((letterMatchesIniNotD && letterMatchesIniD) ||
                                    (!letterMatchesIniNotD && letterMatchesIniD)) {
                                    //IIFE para correção focada em conjunção com D
                                    (() => {
                                        let letterMatchesAfterD = [];
                                        if (!letterNotMatchesAfterD &&
                                            (letterMatchesAfterDOp1 ||
                                                letterMatchesAfterDOp2 ||
                                                letterMatchesAfterDOp3)) {
                                            letterMatchesAfterD = [
                                                ...(letterMatchesAfterDOp1 || []),
                                                ...(letterMatchesAfterDOp2 || []),
                                                ...(letterMatchesAfterDOp3 || []),
                                            ];
                                        }
                                        else if (letterNotMatchesAfterD &&
                                            letterMatchesIniNotD &&
                                            !(letterMatchesAfterDOp1 ||
                                                letterMatchesAfterDOp2 ||
                                                letterMatchesAfterDOp3)) {
                                            letterMatchesAfterD = [...(letterMatchesIniNotD || [])];
                                        }
                                        else if (letterNotMatchesAfterD &&
                                            (letterMatchesAfterDOp1 ||
                                                letterMatchesAfterDOp2 ||
                                                letterMatchesAfterDOp3 ||
                                                letterMatchesIniNotD)) {
                                            letterMatchesAfterD = [
                                                ...(letterMatchesAfterDOp1 || []),
                                                ...(letterMatchesAfterDOp2 || []),
                                                ...(letterMatchesAfterDOp3 || []),
                                            ];
                                        }
                                        //IIFE para capitalização focada em iniciais D
                                        (() => {
                                            letterMatchesAfterD?.forEach(letterMatchD => {
                                                remadeText = fixNextWordsAfterD(remadeText, letterMatchD);
                                            });
                                            textEl.value = remadeText;
                                            for (let iD = 0; iD < Array.from(letterMatchesAfterD ?? []).length; iD++) {
                                                const filteredArrayD = letterMatchesAfterD?.filter(iD => lowercasesRegexObj.test(iD));
                                                if (filteredArrayD) {
                                                    const mappedArrayD = filteredArrayD.map(iD => iD.toUpperCase());
                                                    let remadeStringD = "";
                                                    if (iD === 0) {
                                                        filteredArrayD.splice(iD, 1, mappedArrayD[0]);
                                                        remadeStringD = filteredArrayD
                                                            .toString()
                                                            .replaceAll(",", "");
                                                        [textEl.value, isCursorAutoMoved] =
                                                            correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, textEl);
                                                    }
                                                    else if (iD === 1) {
                                                        filteredArrayD.splice(iD, 1, mappedArrayD[1]);
                                                        remadeStringD = filteredArrayD
                                                            .toString()
                                                            .replaceAll(",", "")
                                                            .slice(2);
                                                        [textEl.value, isCursorAutoMoved] =
                                                            correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, textEl);
                                                        if (textEl.value)
                                                            textEl.value = textEl.value.replace(new RegExp(filteredArrayD[iD], "g"), remadeStringD);
                                                    }
                                                    else if (iD > 2) {
                                                        filteredArrayD.pop();
                                                        filteredArrayD.push(mappedArrayD[iD]);
                                                        [textEl.value, isCursorAutoMoved] =
                                                            correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, textEl);
                                                    }
                                                }
                                            }
                                        })();
                                    })();
                                }
                            })();
                        });
                    }
                    //statement para correção de múltiplos upper cases
                    if (multipleUppercasesMatches || multipleUppercasesMatches2) {
                        //IIFE para encapsular correção de múltiplos upper cases
                        (() => {
                            const unproperUppercases = [
                                ...(multipleUppercasesMatches || []),
                                ...(wrongUppercasesMatchesOp1 || []),
                                ...(wrongUppercasesMatchesOp2 || []),
                                ...(wrongUppercasesMatchesOp3 || []),
                                ...(wrongUppercasesMatchesOp4 || []),
                                ...(wrongUppercasesMatchesOp5 || []),
                                ...(wrongUppercasesMatchesOp6 || []),
                            ];
                            const unproperDUppercases = [
                                ...(wrongUppercasesMatchesOp7 || []),
                                ...(wrongUppercasesMatchesOp8 || []),
                                ...(wrongUppercasesMatchesOp9 || []),
                            ];
                            unproperUppercases.forEach(multipleUppercasesMatch => {
                                if (text && multipleUppercasesMatch) {
                                    text = fixUnproperUppercases(text, multipleUppercasesMatch, "NoD");
                                    //correção de bugs com combinações posteriores de upper/lower
                                    // const upperlowercomb = text.match(
                                    //   /[a-záàâäãéèêëíìîïóòôöõúùûü][A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]/g
                                    // );
                                    // const upperlowercombD = text.match(
                                    //   /D[a-záàâäãéèêëíìîïóòôöõúùûü][\s]/
                                    // );
                                    // if (upperlowercomb || upperlowercombD) {
                                    //   repeatedLetter = repeatedLetter.toLowerCase();
                                    // }
                                    //fix para delay em processamento do S em conjunções
                                    const upperlowercombDS = text.match(/D[a-záàâäãéèêëíìîïóòôöõúùûü][S][\s]/);
                                    if (upperlowercombDS)
                                        upperlowercombDS.splice(3, 1, "s");
                                    textEl.value = text;
                                    isUndoUppercase = true;
                                    [textEl.value, isCursorAutoMoved] = correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, textEl);
                                    if (range.endOffset >= 1)
                                        fixCursorPosition(textEl, range, selection, true);
                                }
                            });
                            unproperDUppercases.forEach(multipleUppercasesMatch => {
                                if (text && multipleUppercasesMatch) {
                                    textEl.value = fixUnproperUppercases(text, multipleUppercasesMatch, "YesDVal");
                                    isUndoUppercase = true;
                                    [textEl.value, isCursorAutoMoved] = correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, textEl);
                                    if (range.endOffset >= 1)
                                        fixCursorPosition(textEl, range, selection, true);
                                }
                            });
                        })();
                    }
                    //statement para controle de combinação após entrada com inicial D
                    if (letterMatchesIniD &&
                        letterNotMatchesAfterD &&
                        !(letterMatchesAfterDOp1 ||
                            letterMatchesAfterDOp2 ||
                            letterMatchesAfterDOp3))
                        letterNotMatchesAfterD = [];
                    //statement para fluxo validando match de iniciais
                    if (letterMatchesIniD || letterMatchesIniNotD) {
                        //IIFE para forçar upper case
                        (() => {
                            const DMatch = [
                                ...(letterMatchesAfterDOp1 || []),
                                ...(letterMatchesAfterDOp2 || []),
                                ...(letterMatchesAfterDOp3 || []),
                            ];
                            const wordMatch = [
                                ...(DMatch || []),
                                ...(letterMatchesIniNotD || []),
                            ];
                            for (let iM = 0; iM < wordMatch.length; iM++) {
                                if (uppercasesRegexObj.test(wordMatch[iM]))
                                    continue;
                                textEl.value = fixForcedUpperCase(textEl, wordMatch, wordMatch[iM]);
                                if (DMatch.flat(1).length > 0) {
                                    [textEl.value, isCursorAutoMoved] = correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, textEl);
                                }
                            }
                        })();
                    }
                    //IIFE para fazer correções adicionais no final da edição automática
                    (() => {
                        if (wrongCharsMatchesOp1)
                            textEl.value =
                                textEl.value?.replaceAll(wrongCharsRegexOp1, "") ?? null;
                        if (wrongCharsMatchesOp2)
                            textEl.value =
                                textEl.value?.replaceAll(wrongCharsRegexOp2, "") ?? null;
                        if (wrongCharsMatchesOp3)
                            textEl.value =
                                textEl.value?.replaceAll(wrongCharsRegexOp3, "") ?? null;
                        if (text.match(/\s[\s]+/g))
                            textEl.value = textEl.value?.replaceAll(/\s[\s]+/g, " ") ?? null;
                        if (text.match(/^[a-záàâäãéèêëíìîïóòôöõúùûü]/))
                            textEl.value = text.slice(0, 1).toUpperCase() + text.slice(1);
                    })();
                }
            }
        }
    }
    else
        ErrorHandler.elementNotFound(textEl, "argument for autoCapitalizeInputs()", extLine(new Error()));
}
export function autoCapitalizeCite(editableCite, isAutocorrectOn = true) {
    const citeText = editableCite?.textContent ?? null;
    if (editableCite instanceof HTMLElement && isAutocorrectOn && citeText) {
        //inicialização de expressões regex com seus objetos e matches associados
        const newWordMatches = citeText.match(/\s[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]?[a-zA-ZáàâäãéèêëíìîïóòôöõúùûüÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]+\s?[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]?[a-zA-ZáàâäãéèêëíìîïóòôöõúùûüÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]*/g);
        const letterMatchesIniNotD = citeText.match(/\s[^d]/g);
        const letterMatchesIniD = citeText.match(/\sd/g);
        let letterNotMatchesAfterD = citeText.match(/\sd[aeioáàâäãéèêëíìîïóòôöõúùûüAEIOÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][sS]?\s/g) ?? [];
        const letterMatchesAfterDOp1 = citeText.match(/\sd[^aeioáàâäãéèêëíìîïóòôöõúùûüAEIOÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]/g);
        const letterMatchesAfterDOp2 = citeText.match(/\sd[aeioáàâäãéèêëíìîïóòôöõúùûüAEIOÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][^sS\s]/g);
        const letterMatchesAfterDOp3 = citeText.match(/\sd[aeioáàâäãéèêëíìîïóòôöõúùûüAEIOÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][sS][a-zA-ZáàâäãéèêëíìîïóòôöõúùûüÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]/g);
        const lowercasesRegexObj = new RegExp(/[a-záàâäãéèêëíìîïóòôöõúùûü]/g);
        const uppercasesRegexObj = new RegExp(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]/);
        const multipleUppercasesMatches = citeText.match(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]{2,}/g);
        const wrongUppercasesMatchesOp1 = citeText.match(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]\b/g);
        const wrongUppercasesMatchesOp2 = citeText.match(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+\b/g);
        const wrongUppercasesMatchesOp3 = citeText.match(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]+[a-záàâäãéèêëíìîïóòôöõúùûü]{2,3}\b/g);
        const wrongUppercasesMatchesOp4 = citeText.match(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü][A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+\b/g);
        const wrongUppercasesMatchesOp5 = citeText.match(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]{1,2}[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+[a-záàâäãéèêëíìîïóòôöõúùûüA-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]+\b/g);
        const wrongUppercasesMatchesOp6 = citeText.match(/[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][a-záàâäãéèêëíìîïóòôöõúùûü]+[a-záàâäãéèêëíìîïóòôöõúùûü]+[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]+[a-záàâäãéèêëíìîïóòôöõúùûü][a-záàâäãéèêëíìîïóòôöõúùûü]+\b/g);
        const wrongUppercasesMatchesOp7 = citeText.match(/D[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][sS]/g);
        const wrongUppercasesMatchesOp8 = citeText.match(/D[AEIOÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][^sS]/g);
        const wrongUppercasesMatchesOp9 = citeText.match(/D[aeioáàâäãéèêëíìîïóòôöõúùûüAEIOÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ][sS]\s/g);
        const wrongStartMatch = citeText
            .match(/^[a-záàâäãéèêëíìîïóòôöõúùûü]+[A-ZÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜ]/)
            ?.toString() ?? null;
        const wrongCharsRegexOp1 = /[\s]*[\d\n,;.+\-=~\\/|"!@#$%&*¬°ªº§¹²³£¢(){}[\]]+[\s]*[\d\n,;.+\-=~\\/|"!@#$%&*¬°ªº§¹²³£¢(){}[\]]*/g;
        const wrongCharsMatchesOp1 = citeText.match(wrongCharsRegexOp1);
        const wrongCharsRegexOp2 = /$[\d\n,;.+\-=~\\/|"!@#$%&*¬°ªº§¹²³£¢(){}[\]]+/g;
        const wrongCharsMatchesOp2 = citeText.match(wrongCharsRegexOp2);
        const wrongCharsRegexOp3 = /(?<=\sdD)[\d\n,;.+\-=~\\/|"!@#$%&*¬°ªº§¹²³£¢(){}[\]]+/g;
        const wrongCharsMatchesOp3 = citeText.match(wrongCharsRegexOp3);
        //inicialização de outras variáveis
        const selection = window.getSelection();
        const range = document.createRange();
        let remadeCiteText = citeText, isUndoUppercase = false, isCursorAutoMoved = false, isSpanActive = false, isAlertMade = false;
        //statement para diferenciar início do restante do input
        if (citeText.length === 1 && !newWordMatches)
            editableCite.textContent = fixFirstLetter(citeText[0], /\b\w/, editableCite, range, selection, true);
        else if (citeText.length > 1) {
            //IIFE para encapsular correção de inícios incorretos de entrada
            (() => {
                if (wrongCharsMatchesOp1 ||
                    wrongCharsMatchesOp2 ||
                    wrongCharsMatchesOp3) {
                    const wrongCharsMatches = [
                        ...(wrongCharsMatchesOp1 || []),
                        ...(wrongCharsMatchesOp2 || []),
                        ...(wrongCharsMatchesOp3 || []),
                    ];
                    for (let iW = 0; iW < wrongCharsMatches.length; iW++) {
                        wrongCharsMatches.forEach(wrongCharMatch => {
                            editableCite.textContent = fixWrongStarts(citeText, wrongCharMatch, wrongCharsMatches[iW].length);
                            [editableCite.textContent, isCursorAutoMoved] =
                                correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, editableCite);
                            isCursorAutoMoved = moveCursorToTheEnd(isCursorAutoMoved, editableCite);
                            [isSpanActive, isAlertMade] = createSpanAlert(isSpanActive, isAlertMade);
                        });
                    }
                }
            })();
            if (wrongStartMatch)
                editableCite.textContent = wrongStartCorrection(editableCite.textContent, wrongStartMatch);
            if (newWordMatches) {
                newWordMatches.forEach(() => {
                    //IIFE para capitalizar palavras após a primeira
                    (() => {
                        if (letterMatchesIniNotD && !letterMatchesIniD) {
                            letterMatchesIniNotD.forEach(letterMatch => {
                                remadeCiteText = fixNextWordsIniNotD(remadeCiteText, letterMatch);
                            });
                            editableCite.textContent = remadeCiteText;
                            isCursorAutoMoved = moveCursorToTheEnd(isCursorAutoMoved, editableCite);
                            [editableCite.textContent, isCursorAutoMoved] =
                                correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, editableCite);
                            editableCite.textContent = wrongStartCorrection(editableCite.textContent, wrongStartMatch);
                        }
                        else if ((letterMatchesIniNotD && letterMatchesIniD) ||
                            (!letterMatchesIniNotD && letterMatchesIniD)) {
                            //IIFE para correção focada em conjunção com D
                            (() => {
                                let letterMatchesAfterD = [];
                                if (!letterNotMatchesAfterD &&
                                    (letterMatchesAfterDOp1 ||
                                        letterMatchesAfterDOp2 ||
                                        letterMatchesAfterDOp3)) {
                                    letterMatchesAfterD = [
                                        ...(letterMatchesAfterDOp1 || []),
                                        ...(letterMatchesAfterDOp2 || []),
                                        ...(letterMatchesAfterDOp3 || []),
                                    ];
                                }
                                else if (letterNotMatchesAfterD &&
                                    letterMatchesIniNotD &&
                                    !(letterMatchesAfterDOp1 ||
                                        letterMatchesAfterDOp2 ||
                                        letterMatchesAfterDOp3)) {
                                    letterMatchesAfterD = [...(letterMatchesIniNotD || [])];
                                }
                                else if (letterNotMatchesAfterD &&
                                    (letterMatchesAfterDOp1 ||
                                        letterMatchesAfterDOp2 ||
                                        letterMatchesAfterDOp3 ||
                                        letterMatchesIniNotD)) {
                                    letterMatchesAfterD = [
                                        ...(letterMatchesAfterDOp1 || []),
                                        ...(letterMatchesAfterDOp2 || []),
                                        ...(letterMatchesAfterDOp3 || []),
                                    ];
                                }
                                //IIFE para capitalização focada em iniciais D
                                (() => {
                                    letterMatchesAfterD.forEach(letterMatchD => {
                                        remadeCiteText = fixNextWordsAfterD(remadeCiteText, letterMatchD);
                                    });
                                    editableCite.textContent = remadeCiteText;
                                    for (let iD = 0; iD < Array.from(letterMatchesAfterD ?? []).length; iD++) {
                                        const filteredArrayD = letterMatchesAfterD?.filter(iD => lowercasesRegexObj.test(iD));
                                        if (filteredArrayD) {
                                            const mappedArrayD = filteredArrayD.map(iD => iD.toUpperCase());
                                            let remadeStringD = "";
                                            if (iD === 0) {
                                                [isSpanActive, isAlertMade] = createSpanAlert(isSpanActive, isAlertMade);
                                                filteredArrayD.splice(iD, 1, mappedArrayD[0]);
                                                remadeStringD = filteredArrayD
                                                    .toString()
                                                    .replaceAll(",", "");
                                                [editableCite.textContent, isCursorAutoMoved] =
                                                    correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, editableCite);
                                            }
                                            else if (iD === 1) {
                                                [isSpanActive, isAlertMade] = createSpanAlert(isSpanActive, isAlertMade);
                                                filteredArrayD.splice(iD, 1, mappedArrayD[1]);
                                                remadeStringD = filteredArrayD
                                                    .toString()
                                                    .replaceAll(",", "")
                                                    .slice(2);
                                                [editableCite.textContent, isCursorAutoMoved] =
                                                    correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, editableCite);
                                                if (editableCite.textContent)
                                                    editableCite.textContent =
                                                        editableCite.textContent.replace(new RegExp(filteredArrayD[iD], "g"), remadeStringD);
                                            }
                                            else if (iD > 2) {
                                                filteredArrayD.pop();
                                                filteredArrayD.push(mappedArrayD[iD]);
                                                [editableCite.textContent, isCursorAutoMoved] =
                                                    correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, editableCite);
                                            }
                                        }
                                    }
                                })();
                            })();
                        }
                    })();
                });
            }
            if (multipleUppercasesMatches) {
                //IIFE para encapsular correção de múltiplos upper cases
                (() => {
                    const unproperUppercases = [
                        ...(multipleUppercasesMatches || []),
                        ...(wrongUppercasesMatchesOp1 || []),
                        ...(wrongUppercasesMatchesOp2 || []),
                        ...(wrongUppercasesMatchesOp3 || []),
                        ...(wrongUppercasesMatchesOp4 || []),
                        ...(wrongUppercasesMatchesOp5 || []),
                        ...(wrongUppercasesMatchesOp6 || []),
                    ];
                    const unproperDUppercases = [
                        ...(wrongUppercasesMatchesOp7 || []),
                        ...(wrongUppercasesMatchesOp8 || []),
                        ...(wrongUppercasesMatchesOp9 || []),
                    ];
                    unproperUppercases.forEach(multipleUppercasesMatch => {
                        if (citeText && multipleUppercasesMatch) {
                            editableCite.textContent = fixUnproperUppercases(citeText, multipleUppercasesMatch, "NoD");
                            isUndoUppercase = true;
                            [editableCite.textContent, isCursorAutoMoved] =
                                correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, editableCite);
                            isCursorAutoMoved = moveCursorToTheEnd(isCursorAutoMoved, editableCite);
                            [isSpanActive, isAlertMade] = createSpanAlert(isSpanActive, isAlertMade);
                        }
                    });
                    unproperDUppercases.forEach(multipleUppercasesMatch => {
                        if (citeText && multipleUppercasesMatch) {
                            editableCite.textContent = fixUnproperUppercases(citeText, multipleUppercasesMatch, "YesDCont");
                            isUndoUppercase = true;
                            [editableCite.textContent, isCursorAutoMoved] =
                                correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, editableCite);
                            isCursorAutoMoved = moveCursorToTheEnd(isCursorAutoMoved, editableCite);
                            [isSpanActive, isAlertMade] = createSpanAlert(isSpanActive, isAlertMade);
                        }
                    });
                })();
            }
        }
        //statement para correção de blocos após inicial com D
        if (letterMatchesIniD &&
            letterNotMatchesAfterD &&
            !(letterMatchesAfterDOp1 ||
                letterMatchesAfterDOp2 ||
                letterMatchesAfterDOp3))
            letterNotMatchesAfterD = [];
        //statement para correção de múltiplos upper cases forçados indevidamente
        if (letterMatchesIniD || letterMatchesIniNotD) {
            //IIFE para forçar upper case
            (() => {
                const DMatch = [
                    ...(letterMatchesAfterDOp1 || []),
                    ...(letterMatchesAfterDOp2 || []),
                    ...(letterMatchesAfterDOp3 || []),
                ];
                const wordMatch = [...(DMatch || []), ...(letterMatchesIniNotD || [])];
                for (let iM = 0; iM < wordMatch.length; iM++) {
                    if (uppercasesRegexObj.test(wordMatch[iM]))
                        continue;
                    editableCite.textContent = fixForcedUpperCase(editableCite, wordMatch, wordMatch[iM]);
                    if (DMatch.flat(1).length > 0) {
                        [editableCite.textContent, isCursorAutoMoved] =
                            correctCursorNextWords(isCursorAutoMoved, isUndoUppercase, wrongStartMatch, editableCite);
                        [isSpanActive, isAlertMade] = createSpanAlert(isSpanActive, isAlertMade);
                    }
                }
            })();
        }
        //IIFE para fazer correções no final da edição automática
        (() => {
            if (wrongCharsMatchesOp1) {
                editableCite.textContent =
                    editableCite.textContent?.replaceAll(wrongCharsRegexOp1, "") ?? null;
                isCursorAutoMoved = moveCursorToTheEnd(isCursorAutoMoved, editableCite);
            }
            if (wrongCharsMatchesOp2) {
                editableCite.textContent =
                    editableCite.textContent?.replaceAll(wrongCharsRegexOp2, "") ?? null;
                isCursorAutoMoved = moveCursorToTheEnd(isCursorAutoMoved, editableCite);
            }
            if (wrongCharsMatchesOp3) {
                editableCite.textContent =
                    editableCite.textContent?.replaceAll(wrongCharsRegexOp3, "") ?? null;
                isCursorAutoMoved = moveCursorToTheEnd(isCursorAutoMoved, editableCite);
            }
            if (editableCite.textContent?.match(/\s[\s]+/g)) {
                editableCite.textContent =
                    editableCite.textContent?.replaceAll(/\s[\s]+/g, " ") ?? null;
                isCursorAutoMoved = moveCursorToTheEnd(isCursorAutoMoved, editableCite);
            }
        })();
    }
    //declarações de funções locais
    function createSpanAlert(isSpanActive = false, isAlertMade = false) {
        const rgbaRegex = /rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/;
        const computedStyleRegex = /,\d+.?\d*.?\d*/g;
        if (editableCite?.nextElementSibling &&
            editableCite instanceof HTMLElement) {
            const nextCiteElementSibling = editableCite.nextElementSibling.id;
            if (nextCiteElementSibling === "deactAutocorrectBtn" && !isSpanActive) {
                const cursorResetAlert = document.createElement("span");
                if (!isAlertMade) {
                    cursorResetAlert.textContent = "Cursor resetado! Aperte alguma tecla";
                    isAlertMade = true;
                }
                editableCite.parentNode?.insertBefore(cursorResetAlert, editableCite.nextSibling);
                cursorResetAlert.setAttribute("class", "briefAlert");
                cursorResetAlert.setAttribute("id", "briefAlertCite");
                cursorResetAlert.style.setProperty("border-color", "white");
                cursorResetAlert.style.setProperty("opacity", "1");
                cursorResetAlert.style.setProperty("font-size", "8px");
                editableCite.style.setProperty("border-color", "rgba(255, 165, 0, 0.9)"); //alertar usuário da mudança de cursor devido à reconstrução do textContent editável
                isSpanActive = true;
                setTimeout(() => {
                    const computedStyleCite = window
                        .getComputedStyle(editableCite)
                        .getPropertyValue("border-color");
                    const rgbaMatch = computedStyleCite.match(rgbaRegex);
                    if (rgbaMatch) {
                        const reduceOpacity = setInterval(() => {
                            const poppedArray = rgbaMatch.pop(); //faz a retirada inicial
                            let strUpdatedAlpha = poppedArray?.toString();
                            const strRgba = rgbaMatch
                                .toString()
                                .replaceAll(computedStyleRegex, "");
                            const firstSliceStrRgba = strRgba.slice(0, 18);
                            let strNewOpacityValue = firstSliceStrRgba + " " + strUpdatedAlpha + ")";
                            if (strUpdatedAlpha && strUpdatedAlpha <= "0.05") {
                                strUpdatedAlpha = "0";
                                strNewOpacityValue = firstSliceStrRgba + "0)";
                                cursorResetAlert.remove();
                                clearInterval(reduceOpacity);
                            }
                            editableCite.style.setProperty("border-color", strNewOpacityValue);
                        }, 100);
                    }
                }, 500);
            }
            else if (nextCiteElementSibling === "briefAlertCite" || isSpanActive) {
                //algum efeito visual
            }
        }
        return [isSpanActive, isAlertMade];
    }
}
export function removeFirstClick(el) {
    let cursorPosition = 0;
    if (el instanceof Element) {
        if (el.textContent === "Insira Seu Nome Aqui")
            el.textContent = "";
        setInterval(() => {
            cursorPosition = GlobalHandler.cursorCheckTimer() ?? 0;
        }, 3000);
    }
    else
        ErrorHandler.elementNotFound(el, "argument for removeFirstClick()", extLine(new Error()));
    return cursorPosition ?? 0;
}
export function checkAutoCorrect(deactAutocorrectBtn) {
    let isAutocorrectOn = true;
    if (deactAutocorrectBtn instanceof HTMLButtonElement) {
        deactAutocorrectBtn.textContent?.match(/Ativar/)
            ? (isAutocorrectOn = false)
            : (isAutocorrectOn = true);
    }
    else if (deactAutocorrectBtn instanceof HTMLInputElement &&
        (deactAutocorrectBtn.type === "checkbox" ||
            deactAutocorrectBtn.type === "radio")) {
        deactAutocorrectBtn.checked
            ? (isAutocorrectOn = true)
            : (isAutocorrectOn = false);
    }
    return isAutocorrectOn;
}
export function switchAutocorrect(click, deactAutocorrectBtn, isAutocorrectOn = true) {
    if (click?.target === deactAutocorrectBtn)
        if (deactAutocorrectBtn instanceof HTMLButtonElement) {
            isAutocorrectOn = !isAutocorrectOn; //if-if não funciona aqui
            isAutocorrectOn
                ? (deactAutocorrectBtn.textContent = "Desativar Autocorreção")
                : (deactAutocorrectBtn.textContent = "Ativar Autocorreção");
        }
        else if (deactAutocorrectBtn instanceof HTMLInputElement &&
            (deactAutocorrectBtn.type === "checkbox" ||
                deactAutocorrectBtn.type === "radio"))
            isAutocorrectOn = !isAutocorrectOn;
        else
            ErrorHandler.elementNotFound(deactAutocorrectBtn, "arguments for switchAutocorrect()", extLine(new Error()));
    return isAutocorrectOn;
}
export function checkAllGenConts(...els) {
    if (Array.isArray(els) &&
        els?.every(el => el instanceof HTMLSelectElement ||
            el instanceof HTMLInputElement ||
            el instanceof HTMLTextAreaElement))
        return true;
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for checkAllGenConts()", `${JSON.stringify(els)}`);
    return false;
}
export function fluxGen(arrGenConts, genIniValue = "masculino") {
    if (Array.isArray(arrGenConts) &&
        arrGenConts?.every(genCont => genCont instanceof HTMLSelectElement ||
            genCont instanceof HTMLInputElement ||
            genCont instanceof HTMLTextAreaElement) &&
        typeof genIniValue === "string") {
        const [gen, genBirthRel, genTrans, genFisAlin] = arrGenConts;
        if (gen.value === "masculino" || gen.value === "feminino") {
            if (genBirthRel.value === "cis") {
                hideGenFisAlin(genFisAlin);
                hideStgTransHorm(genTrans);
                return genIniValue || gen.value;
            }
            else if (genBirthRel.value === "trans") {
                showStgTransHorm(genTrans);
                if (genTrans.value === "avancado") {
                    hideGenFisAlin(genFisAlin);
                    return genIniValue || gen.value;
                }
                else if (genTrans.value === "undefined" ||
                    genTrans.value === "no" ||
                    genTrans.value === "inicial" ||
                    genTrans.value === "intermediario") {
                    showGenFisAlin(genFisAlin);
                    const contFeminilizado = document.querySelector('option[value="feminilizado"]');
                    const contMasculinizado = document.querySelector('option[value="masculinizado"]');
                    if (contFeminilizado instanceof HTMLOptionElement &&
                        contMasculinizado instanceof HTMLOptionElement) {
                        if (genTrans.value === "intermediario") {
                            if (gen.value === "masculino") {
                                contFeminilizado?.selected &&
                                    contFeminilizado.removeAttribute("selected");
                                contMasculinizado.setAttribute("selected", "");
                            }
                            if (gen.value === "feminino") {
                                contMasculinizado?.selected &&
                                    contMasculinizado.removeAttribute("selected");
                                contFeminilizado.setAttribute("selected", "");
                            }
                        }
                        else {
                            contMasculinizado?.selected &&
                                contMasculinizado.removeAttribute("selected");
                            contFeminilizado?.selected &&
                                contFeminilizado.removeAttribute("selected");
                        }
                    }
                    switch (genFisAlin.value) {
                        case "masculinizado":
                            return "masculino";
                        case "feminilizado":
                            return "feminino";
                        case "neutro":
                            return "neutro";
                        default:
                            ErrorHandler.stringError("argument for genFisAlin.value switch", genFisAlin?.value, extLine(new Error()));
                    }
                    if (genFisAlin.value === "masculinizado")
                        return "masculino";
                    else if (genFisAlin.value === "feminilizado")
                        return "feminino";
                    else if (genFisAlin.value === "neutro")
                        return "neutro";
                }
            }
            else if (genBirthRel.value === "outros" ||
                genBirthRel.value === "undefined") {
                showGenFisAlin(genFisAlin);
                if (genFisAlin.value === "masculinizado")
                    return "masculino";
                else if (genFisAlin.value === "feminilizado")
                    return "feminino";
                else if (genFisAlin.value === "neutro")
                    return "neutro";
            }
        }
        else if (gen.value === "naoBinario" ||
            gen.value === "outros" ||
            gen.value === "undefined") {
            genBirthRel.value === "trans"
                ? showStgTransHorm(genTrans)
                : hideStgTransHorm(genTrans);
            showGenFisAlin(genFisAlin);
            if (genFisAlin.value === "masculinizado")
                return "masculino";
            else if (genFisAlin.value === "feminilizado")
                return "feminino";
            else if (genFisAlin.value === "neutro")
                return "neutro";
        }
        else
            ErrorHandler.stringError("obtendo gen.value", gen?.value ?? "UNDEFINED VALUE", extLine(new Error()));
    }
    else
        ErrorHandler.multipleElementsNotFound(extLine(new Error()), "arguments for fluxGen()", `${JSON.stringify(arrGenConts)}` || null);
    return "masculino";
}
export function showGenFisAlin(genFisAlin) {
    if (genFisAlin instanceof HTMLSelectElement ||
        genFisAlin instanceof HTMLInputElement ||
        (genFisAlin instanceof HTMLTextAreaElement &&
            genFisAlin.closest(".genSpan"))) {
        if (genFisAlin.closest(".genSpan")?.hidden === true) {
            GlobalStyle.fadeElement(genFisAlin.closest(".genSpan"), "0");
            setTimeout(() => {
                console.log("shown");
                genFisAlin.closest(".genSpan")?.removeAttribute("hidden");
                setTimeout(() => {
                    GlobalStyle.fadeElement(genFisAlin.closest(".genSpan"), "1");
                }, 250);
            }, 250);
        }
        return true;
    }
    else
        ErrorHandler.elementNotFound(genFisAlin, "argument for showGenFisAlin()", extLine(new Error()));
    return false;
}
export function hideGenFisAlin(genFisAlin) {
    if (genFisAlin instanceof HTMLSelectElement ||
        genFisAlin instanceof HTMLInputElement ||
        (genFisAlin instanceof HTMLTextAreaElement &&
            genFisAlin.closest(".genSpan"))) {
        if (genFisAlin.closest(".genSpan")?.hidden === false) {
            setTimeout(() => {
                GlobalStyle.fadeElement(genFisAlin.closest(".genSpan"), "0");
                setTimeout(() => {
                    genFisAlin.closest(".genSpan")?.setAttribute("hidden", "");
                }, 500);
            }, 250);
        }
        return false;
    }
    else
        ErrorHandler.elementNotFound(genFisAlin, "argument for hideGenFisAlin()", extLine(new Error()));
    return true;
}
export function showStgTransHorm(genTrans) {
    if (genTrans instanceof HTMLSelectElement ||
        genTrans instanceof HTMLInputElement ||
        (genTrans instanceof HTMLTextAreaElement &&
            genTrans.closest(".genSpan"))) {
        if (genTrans.closest(".genSpan")?.hidden === true) {
            GlobalStyle.fadeElement(genTrans.closest(".genSpan"), "0");
            console.log("shown");
            setTimeout(() => {
                genTrans.closest(".genSpan")?.removeAttribute("hidden");
                setTimeout(() => {
                    GlobalStyle.fadeElement(genTrans.closest(".genSpan"), "1");
                }, 250);
            }, 250);
        }
        return true;
    }
    else
        ErrorHandler.elementNotFound(genTrans, "argument for showStgTransHorm()", extLine(new Error()));
    return false;
}
export function hideStgTransHorm(genTrans) {
    if (genTrans instanceof HTMLSelectElement ||
        genTrans instanceof HTMLInputElement ||
        (genTrans instanceof HTMLTextAreaElement &&
            genTrans.closest(".genSpan"))) {
        if (genTrans.closest(".genSpan")?.hidden === false) {
            setTimeout(() => {
                GlobalStyle.fadeElement(genTrans.closest(".genSpan"), "0");
                setTimeout(() => {
                    genTrans.closest(".genSpan")?.setAttribute("hidden", "");
                }, 500);
            }, 250);
        }
        return false;
    }
    else
        ErrorHandler.elementNotFound(genTrans, "argument for hideStgTransHorm()", extLine(new Error()));
    return true;
}
export function filterIdsByGender(arrayIds = ["peit", "abd", "coxa"], bodyType = "masculino") {
    if (Array.isArray(arrayIds) &&
        arrayIds?.every(prop => typeof prop === "string") &&
        typeof bodyType === "string") {
        switch (bodyType) {
            case "masculino":
                return arrayIds.filter(id => /peit|abd|coxa/g.test(id));
            case "feminino":
                return arrayIds.filter(id => /tricp|suprail|coxa/g.test(id));
            case "neutro":
                return arrayIds.filter(id => /peit|abd|tricp|suprail|coxa/g.test(id));
            default:
                ErrorHandler.stringError(`obtaining valid bodyType`, bodyType, extLine(new Error()));
        }
    }
    else {
        ErrorHandler.typeError(`validating array in filterIdsByGender()`, bodyType, "string", extLine(new Error()));
    }
    return ["peit", "abd", "coxa"];
}
export function generatePersonInstance(person) {
    if (person &&
        "gen" in person &&
        typeof person.gen === "string" &&
        person.gen !== "") {
        if (person.gen === "masculino")
            person = new Man(person.gen, person.age || 0, person.weight || 0, person.height || 0, person.sumDCut || 0, person.atvLvl || "leve");
        else if (person.gen === "feminino")
            person = new Woman(person.gen, person.age || 0, person.weight || 0, person.height || 0, person.sumDCut || 0, person.atvLvl || "leve");
        else if (person.gen === "neutro")
            person = new Neutro(person.gen, person.age || 0, person.weight || 0, person.height || 0, person.sumDCut || 0, person.atvLvl || "leve");
        else
            ErrorHandler.stringError("person.gen", person?.gen, extLine(new Error()));
    }
    else
        ErrorHandler.typeError("person.gen", person?.gen, "string", extLine(new Error()));
    return person;
}
