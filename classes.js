export class JSONStorager {
    #id;
    #value;
    constructor(id = "", value = "") {
        this.#id = id;
        this.#value = value;
        Object.freeze(this);
    }
    get showInpId() {
        return this.#id;
    }
    get showInpValue() {
        return this.#value;
    }
    get showAllInfo() {
        return [this.#id, this.#value];
    }
}
export class JSONTitleStorager {
    #title;
    constructor(title = null) {
        this.#title = title;
        Object.freeze(this);
    }
    get showInpTitle() {
        return this.#title;
    }
}
export class Person {
    gen;
    age;
    weight;
    height;
    sumDCut;
    atvLvl;
    constructor(gen = "masculino", age = 0, weight = 0, height = 0, sumDCut = 0, atvLvl = "leve") {
        this.gen = gen;
        this.age = age;
        this.weight = weight;
        this.height = height;
        this.sumDCut = sumDCut;
        this.atvLvl = atvLvl;
    }
    checkAtvLvl(personInfo) {
        if (((personInfo instanceof Man ||
            personInfo instanceof Woman ||
            personInfo instanceof Woman ||
            personInfo instanceof Person) &&
            "atvLvl" in personInfo &&
            this.atvLvl !== "") ||
            typeof personInfo === "string") {
            if (typeof personInfo === "string")
                this.atvLvl = personInfo;
            switch (this.atvLvl) {
                case "sedentario":
                    return 1.2;
                case "leve":
                    return 1.4;
                case "moderado":
                    return 1.6;
                case "intenso":
                    return 1.9;
                case "muitoIntenso":
                    return 2.2;
                default:
                    console.error(`Error validating case. Obtained this.atvLvl: ${this.atvLvl ?? "null"}; Accepted values: sedentário || leve || moderado || intenso || muitoIntenso`);
            }
        }
        else {
            console.error(`Error validating instance of person. Obtained value: ${personInfo ?? "null"}; instance ${Object.prototype.toString.call(personInfo).slice(8, -1) ?? "null"}; Value of Nível of Atividade Física obtained: ${this.atvLvl ?? "null"}`);
            return 0;
        }
        return 0;
    }
    calcIMC(personInfo) {
        try {
            if (((personInfo instanceof Man ||
                personInfo instanceof Woman ||
                personInfo instanceof Woman ||
                personInfo instanceof Person) &&
                "weight" in personInfo &&
                typeof this.weight === "number" &&
                this.weight >= 0 &&
                "height" in this &&
                typeof this.height === "number" &&
                this.height >= 0) ||
                (Array.isArray(personInfo) &&
                    typeof personInfo[0] === "number" &&
                    typeof personInfo[1] === "number")) {
                if (Array.isArray(personInfo)) {
                    [this.weight, this.height] = personInfo;
                }
                let IMC = this.weight / this.height ** 2;
                if (Number.isNaN(IMC) || IMC === Math.abs(Infinity))
                    IMC = 0;
                console.log("weight " + this.weight);
                console.log("height " + this.height);
                console.log("IMC VALUE " + IMC);
                console.log("");
                console.log("");
                if (IMC >= 0) {
                    let MLG = this.weight - this.weight * (IMC / 100) ?? 0;
                    if (Number.isNaN(MLG) || MLG === Math.abs(Infinity))
                        MLG = 0;
                    if (IMC < 18.5)
                        return ["abaixo", IMC, MLG];
                    else if (IMC >= 18.5 && IMC < 25.0)
                        return ["eutrofico", IMC, MLG];
                    else if (IMC >= 25.0 && IMC < 30)
                        return ["sobrepeso", IMC, MLG];
                    else if (IMC >= 30 && IMC < 35)
                        return ["obeso1", IMC, MLG];
                    else if (IMC >= 35 && IMC < 40)
                        return ["obeso2", IMC, MLG];
                    else if (IMC > 40)
                        return ["obeso3", IMC, MLG];
                    else
                        throw new Error(`Error classifying IMC. Obtained value: ${IMC ?? 0}; Values have to be positive.`);
                }
                else
                    throw new Error(`Error calculating IMC. Used values: Weight ${this.weight ?? 0} and Height ${this.height ?? 0}`);
            }
            else
                throw new Error(`Error validating data for person. 
          Element person: ${Object.prototype.toString.call(personInfo).slice(8, -1) ?? "null"}; 
          Weight present: ${"weight" in personInfo ?? false};
          Weight obtained: ${this.weight ?? 0};
          Height present: ${"height" in personInfo ?? false};
          Height obtained: ${this.height ?? 0}`);
        }
        catch (IMCError) {
            console.error(IMCError.message);
        }
        return ["", 0, 0];
    }
    calcPGC(person) {
        if ((person instanceof Man ||
            person instanceof Woman ||
            person instanceof Woman ||
            person instanceof Person) &&
            "sumDCut" in person &&
            typeof this.sumDCut === "number" &&
            this.sumDCut >= 0) {
            if (person instanceof Man) {
                let DC = 1.10938 -
                    0.0008267 * this.sumDCut +
                    0.0000016 * this.sumDCut ** 2 -
                    0.0002574 * person.age;
                if (DC <= 0 || Number.isNaN(DC))
                    DC = 0.01;
                let PGC = 495 / DC - 450;
                if (PGC <= 0 || Number.isNaN(PGC))
                    PGC = 0.01;
                if (PGC > 100)
                    PGC = 100;
                return PGC;
            }
            else if (person instanceof Woman) {
                let DC = 1.0994921 -
                    0.0009929 * this.sumDCut +
                    0.0000023 * this.sumDCut ** 2 -
                    0.0001392 * person.age;
                if (DC <= 0 || Number.isNaN(DC))
                    DC = 0.01;
                let PGC = 495 / DC - 450;
                if (PGC <= 0 || Number.isNaN(PGC))
                    PGC = 0.01;
                if (PGC > 100)
                    PGC = 100;
                return PGC;
            }
            else if (person instanceof Neutro) {
                let DC = 1.10443605 -
                    0.0009098 * this.sumDCut +
                    0.00000195 * this.sumDCut ** 2 -
                    0.0001983 * person.age;
                if (DC <= 0 || Number.isNaN(DC))
                    DC = 0.01;
                let PGC = 495 / DC - 450;
                if (PGC <= 0 || Number.isNaN(PGC))
                    PGC = 0.01;
                if (PGC > 100)
                    PGC = 100;
                return PGC;
            }
            else
                console.error(`Invalid instance of object. Obtained instance: ${Object.prototype.toString.call(person).slice(8, -1) ?? "null"}`);
            return 0;
        }
        else
            console.warn(`Error validating .sumDCut:
      It is present: ${"sumDCut" in person ?? false};
      Obtained primitive type for .sumDCut: ${typeof this.sumDCut};
      Obtained value: ${this.sumDCut ?? 0}`);
        return 0;
    }
    calcTMB(person, IMC = 0, MLG = 0, factorAtleta = "Peso") {
        if (factorAtleta === "peso")
            factorAtleta = "Peso";
        if (factorAtleta === "mlg")
            factorAtleta = "MLG";
        try {
            if ((person instanceof Man ||
                person instanceof Woman ||
                person instanceof Woman ||
                person instanceof Person) &&
                "atvLvl" in person &&
                this.atvLvl &&
                typeof this.atvLvl === "string" &&
                typeof IMC === "number" &&
                typeof MLG === "number" &&
                typeof factorAtleta === "string") {
                if (this.atvLvl === "muitoIntenso" &&
                    (factorAtleta === "MLG" || factorAtleta === "Peso")) {
                    if (factorAtleta === "MLG") {
                        if (MLG && MLG >= 0)
                            return ["tinsley", 25.9 * MLG + 284];
                        else
                            throw new Error(`Error validating MLG.
              Obtained value: ${MLG ?? 0}`);
                    }
                    else if (factorAtleta === "Peso") {
                        if ("weight" in person && this.weight >= 0)
                            return ["tinsley", 24.8 * this.weight + 10];
                        else
                            throw new Error(`Error validating weight.
              Obtained value: ${this.weight ?? 0}`);
                    }
                }
                else if (this.atvLvl === "sedentario" ||
                    this.atvLvl === "leve" ||
                    this.atvLvl === "moderado" ||
                    this.atvLvl === "intenso") {
                    if ("weight" in person &&
                        this.weight >= 0 &&
                        "height" in person &&
                        this.height >= 0 &&
                        "age" in person) {
                        if (IMC < 25.0 && IMC >= 0) {
                            if (person instanceof Man)
                                return [
                                    "harrisBenedict",
                                    66 +
                                        (13.8 * this.weight + 5.0 * this.height - 6.8 * this.age),
                                ];
                            else if (person instanceof Woman)
                                return [
                                    "harrisBenedict",
                                    655 +
                                        (9.6 * this.weight + 1.9 * this.height - 4.7 * this.age),
                                ];
                            else if (person instanceof Neutro)
                                return [
                                    "harrisBenedict",
                                    360.5 +
                                        (11.7 * this.weight + 3.45 * this.height - 5.75 * this.age),
                                ];
                            else
                                throw new Error(`Error validating instance of Person. Obtained instance: ${Object.prototype.toString.call(person).slice(8, -1) ??
                                    "null"}`);
                        }
                        else if (IMC >= 25.0) {
                            if (person instanceof Man)
                                return [
                                    "mifflinStJeor",
                                    10 * this.weight + 6.25 * this.height - 5.0 * this.age + 5,
                                ];
                            else if (person instanceof Woman)
                                return [
                                    "mifflinStJeor",
                                    10 * this.weight + 6.25 * this.height - 5.0 * this.age - 161,
                                ];
                            else if (person instanceof Neutro)
                                return [
                                    "mifflinStJeor",
                                    10 * this.weight + 6.25 * this.height - 5.0 * this.age - 78,
                                ];
                            else
                                throw new Error(`Error validating instance of Person. Obtained instance: ${Object.prototype.toString
                                    .call(person)
                                    .slice(8, -1)}`);
                        }
                        else
                            throw new Error(`Error validating IMC. IMC obtained: ${IMC ?? 0}; Valor deve ser númerico, positivo e float`);
                    }
                    else
                        throw new Error(`Error validating properties of person.
            Weight present: ${"weight" in person ?? false};
            Value of weight obtained: ${this.weight ?? 0};
            Height present: ${"height" in person ?? false};
            Value of height obtained: ${this.height ?? 0};
            age present: ${"age" in person ?? false};
            `);
                }
                else {
                    throw new Error(`Error validating atvLvl and/or factorAtleta.
            atvLvl obtained: ${this.atvLvl ?? "null"}
            Fator obtained: ${factorAtleta ?? "null"}; Fatores válidos: "MLG" || "Peso"`);
                }
            }
            else {
                throw new Error(`Error validating person.
        Elemento: ${person ?? "null"};
        instance: ${Object.prototype.toString.call(person).slice(8, -1) ?? "null"};
        atvLvl present: ${"atvLvl" in person ?? false};
        Value of atvLvl obtained: ${this.atvLvl ?? "null"};
        Primitive type of .atvLvl: ${typeof this.atvLvl};
        Primitive type of IMC: ${typeof IMC};
        Primitive type of MLG: ${typeof MLG};
        Primitive type of factorAtleta: ${typeof factorAtleta}.`);
            }
        }
        catch (TMBError) {
            console.error(TMBError.message);
        }
        return ["", 0];
    }
    calcGET(TMB = 0, factorAtvLvl = 1.4) {
        if (TMB && factorAtvLvl)
            return TMB * factorAtvLvl;
        else
            console.error(`Error validating arguments.
      TMB obtained: ${TMB ?? 0};
      factorAtvLvl obtained: ${factorAtvLvl ?? 0}`);
        return 0;
    }
    static clonePerson(person) {
        if ((person instanceof Man ||
            person instanceof Woman ||
            person instanceof Woman ||
            person instanceof Person) &&
            "gen" in person &&
            typeof person.gen === "string") {
            switch (person.gen) {
                case "masculino":
                    return new Man(person.gen, person.age, person.weight, person.height, person.sumDCut, person.atvLvl);
                case "feminino":
                    return new Woman(person.gen, person.age, person.weight, person.height, person.sumDCut, person.atvLvl);
                case "neutro":
                    return new Neutro(person.gen, person.age, person.weight, person.height, person.sumDCut, person.atvLvl);
                default:
                    console.error(`Error validating .gen of person for .clonePerson()
          .gen obtained: ${person?.gen ?? "null"}.`);
            }
        }
        else
            console.error(`Error validating person.
      object obtained: ${Object.prototype.toString.call(person).slice(8, -1) ?? "null"};
      .gen present: ${"gen" in person ?? false};
      Primitive type of .gen: ${typeof person.gen}`);
        return person;
    }
}
export class Man extends Person {
}
export class Woman extends Person {
}
export class Neutro extends Person {
}
