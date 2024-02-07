export const extLine = (error) => error.stack?.split("\n")[1]?.trim()?.slice(-3, -1) || "NULL";
export function elementNotFound(element, elementName, line) {
    element ??= "UNDEFINED";
    elementName ||= "UNNAMED";
    line ||= "UNDEFINED";
    if (element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLOptionElement)
        console.error(`
  ELEMENT NOT FOUND, LINE ${line ?? "UNDEFINED"}:
  Error validating instance of ${element?.id || elementName || "NULL"}.
  Obtained instance: ${Object.prototype.toString.call(element)?.slice(8, -1) || "NULL"};
  Obtained value: ${element?.value ?? "NULL"}.`);
    else
        console.error(`
  ELEMENT NOT FOUND, LINE ${line ?? "UNDEFINED"}:
  Error validating instance of ${element?.id || elementName || "UNDEFINED ID OR NAME"}.
  Obtained instance: ${Object.prototype.toString.call(element)?.slice(8, -1) || "NULL"}.`);
}
export function inputNotFound(element, elementName, line) {
    element ??= "UNDEFINED";
    elementName ||= "UNNAMED";
    line ||= "UNDEFINED";
    console.error(`INPUT NOT FOUND, LINE ${line ?? "UNDEFINED"}:
  Error validating ${element?.id || elementName || "UNDEFINED ID OR NAME"}.
  Obtained Element: ${element ?? "NULL"};
  Obtained instance: ${Object.prototype.toString.call(element)?.slice(8, -1) || "NULL"};
  Obtained type (only for <input>): ${element?.type || "NULL"};
  Obtained value: ${element?.value || "NULL"};
  Obtained .checked: ${element?.checked || "NULL"}.`);
}
export function elementWithArrayError(context, array, arrayName, element, elementName, line) {
    context ||= "UNDEFINED";
    arrayName ||= "UNDEFINED NAME";
    array ??= "UNDEFINED";
    element ??= "UNDEFINED";
    elementName ||= "UNNAMED";
    line ||= "UNDEFINED";
    console.error(`ELEMENT WITH ARRAY ERROR, LINE ${line ?? "UNDEFINED"}:
  Error validating ${context}.
  ${elementName ?? "UNNAMED"} obtained: ${JSON.stringify(array) || null};
  Instance of ${arrayName ?? "UNNAMED ARRAY"} obtained: ${Object.prototype.toString.call(element)?.slice(8, -1) ?? "NULL"}.`);
}
export function elementWithObjectError(context, object = {}, element, elementName, line) {
    context ||= "UNDEFINED";
    element ??= "UNDEFINED";
    elementName ||= "UNNAMED";
    line ||= "UNDEFINED";
    console.error(`ELEMENT WITH OBJECT ERROR, LINE ${line ?? "UNDEFINED"}:
    Erro ${context ?? "UNDEFINED"}. Elemento: ${JSON.stringify(object) || null}; instância: ${object?.constructor?.name ?? "NULL"}
    ${elementName ?? "UNNAMED"}: Obtained instance: ${Object.prototype.toString.call(element)?.slice(8, -1) ?? "NULL"}`);
}
export function elementNotPopulated(array, arrayName, line) {
    array ??= "UNDEFINED";
    arrayName ||= "UNNAMED ARRAY";
    line ||= "UNDEFINED";
    let arrInstances = [];
    if (array instanceof HTMLCollection || array instanceof NodeList)
        array = Array.from(array).filter(item => item instanceof Element);
    if (array instanceof Array &&
        array.every(item => item instanceof Element || typeof item === "object")) {
        arrInstances = array.map(el => Object.prototype.toString.call(el).slice(8, -1) + " ");
    }
    console.error(`ELEMENT POPULATION ERROR, LINE ${line ?? "UNDEFINED"}:
  Error validating ${arrayName || "NULL"}.
  Is Array: ${Array.isArray(array)};
  Instance: ${Object.prototype.toString.call(array)?.slice(8, -1) || "NULL"};
  Obtained length: ${array?.length || "0"};
  Stringification: ${JSON.stringify(array) || "NULL"}
  Individual instances: ${arrInstances}`);
    if (array instanceof Array &&
        array.some(item => item instanceof HTMLElement)) {
        console.error(JSON.stringify(array
            .filter(item => item instanceof HTMLElement)
            .map((item, i) => `${i}. ${item.id} `)));
    }
}
export function multipleElementsNotFound(line, context, ...elements) {
    line ||= "UNDEFINED";
    context ||= "UNDEFINED";
    let errorMessage = `MULTIPLE ELEMENTS NOT FOUND, LINE ${line ?? "UNDEFINED"}:
  Error validating ${context || "Undefined Function Name"}.`;
    const mappedNullElements = elements.map(element => element === null || element === undefined ? "NULL" : element);
    mappedNullElements.forEach(element => {
        if (element instanceof HTMLInputElement ||
            element instanceof HTMLTextAreaElement ||
            element instanceof HTMLSelectElement ||
            element instanceof HTMLOptionElement) {
            if (element instanceof HTMLInputElement &&
                (element.type === "radio" || element.type === "checkbox"))
                errorMessage += `
        Instance of ${element.id || "NULL"} obtained: ${Object.prototype.toString.call(element)?.slice(8, -1) ?? "NULL"};\n
        .checked obtained: ${element?.checked || "NULL"}`;
            else
                errorMessage += `
        Instance of ${element.id || "NULL"} obtained: ${Object.prototype.toString.call(element)?.slice(8, -1) ?? "NULL"};\n
        Obtained value: ${element?.value || "NULL"}`;
        }
        else
            errorMessage += `
      Instance of ${element.id || "NULL"} obtained: ${Object.prototype.toString.call(element)?.slice(8, -1) ?? "NULL"};\n`;
    });
    console.error(errorMessage);
}
export function elementsNotFoundFunction(line, funcName, ...elements) {
    line ||= "UNDEFINED";
    funcName ||= "UNDEFINED FUNCTION NAME";
    let errorMessage = `ELEMENTS NOT FOUND FOR FUNCTION, LINE ${line ?? "UNDEFINED"}:
  Error validating Obtained instance for ${funcName || "NULL"}`;
    const mappedNullElements = elements.map(element => element === null || element === undefined ? "NULL" : element);
    mappedNullElements.forEach(element => {
        if (element instanceof HTMLInputElement ||
            element instanceof HTMLTextAreaElement ||
            element instanceof HTMLSelectElement ||
            element instanceof HTMLOptionElement) {
            if (element instanceof HTMLInputElement &&
                (element.type === "radio" || element.type === "checkbox"))
                errorMessage += `Instance of ${element.id || "NULL"} obtained: ${Object.prototype.toString.call(element)?.slice(8, -1) ?? "NULL"};\n
        .checked obtained: ${element?.checked || "NULL"}`;
            else
                errorMessage += `Instance of ${element.id || "NULL"} obtained: ${Object.prototype.toString.call(element)?.slice(8, -1) ?? "NULL"};\n
        Obtained value: ${element?.value || "NULL"}`;
        }
        else
            errorMessage += `Instance of ${element?.id || "NULL"} obtained: ${Object.prototype.toString.call(element)?.slice(8, -1) ?? "NULL"};\n`;
    });
    console.error(errorMessage);
}
export function maxNumberError(unvalidNumber, title, line) {
    unvalidNumber ??= "UNDEFINED NUMBER";
    if (typeof unvalidNumber === "number")
        unvalidNumber = unvalidNumber.toString();
    title ||= "UNDEFINED TITLE";
    line ||= "UNDEFINED";
    console.error(`MAX NUMBER ERROR, LINE ${line ?? "UNDEFINED"}:
  Number of ${title || "Undefined Title"} invalid.
  Max number obtained: ${parseInt(unvalidNumber, 10) || 0}`);
}
export function stringError(context, text, line) {
    context ||= "UNDEFINED CONTEXT";
    text ||= "UNDEFINED";
    line ||= "UNDEFINED";
    console.error(`STRING ERROR, LINE ${line ?? "UNDEFINED"}:
  Error validating ${context}.
  Value obtained: ${text ?? "NULL"}`);
}
export function matchError(context, element, text, line) {
    context ||= "UNDEFINED CONTEXT";
    element ??= "UNDEFINED";
    text ||= "UNDEFINED";
    line ||= "UNDEFINED";
    console.error(`MATCH ERROR, LINE ${line ?? "UNDEFINED"}:
  Error validating ${context || "UNDEFINED"}.
  Obtained Element: ${element || "UNDEFINED"};
  Title obtained: ${text || "Undefined Title"}.`);
}
export function typeError(context, element, acceptedType, line) {
    context ||= "UNDEFINED CONTEXT";
    element ??= "UNDEFINED";
    acceptedType ||= "UNDEFINED";
    line ||= "UNDEFINED";
    console.error(`TYPE ERROR, LINE ${line ?? "UNDEFINED"}:
  Primitive type obtained for ${context || "UNDEFINED"} incorrect.
  Type obtained: ${typeof element ?? "Undefined typeof"};
  Type accepted: ${acceptedType || "Undefined Accepted Type"}`);
}
export function objectError(context, object = {}, objectName, maxPropertiesNumber, line) {
    context ||= "UNDEFINED CONTEXT";
    objectName ||= "UNDEFINED";
    maxPropertiesNumber ||= "UNDEFINED";
    line ||= "UNDEFINED";
    console.error(`OBJECT ERROR, LINE ${line ?? "UNDEFINED"}:
  Error validating ${objectName ?? "UNDEFINED OBJECT NAME"} for ${context || "UNDEFINED"}.
  Object obtained: ${JSON.stringify(object) || "Undefined Object"};
  Número obtained of properties: ${Object.keys.length ?? 0}; Número accepted: ${maxPropertiesNumber ?? 0}`);
}
