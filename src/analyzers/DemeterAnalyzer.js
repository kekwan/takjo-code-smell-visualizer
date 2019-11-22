import * as ut from "./Utils.js";

export class DemeterAnalyzer{
    classMap = new Map();

    run(obj, map) {
        this.classMap = map;
        obj = this.lawOfDemeterCheck(obj);
        return obj;
    }

    // Read files (classes) and for every method check how many times it violates the Law of Demeter
    // as defined https://hackernoon.com/object-oriented-tricks-2-law-of-demeter-4ecc9becad85
    lawOfDemeterCheck(obj) {
        let util = new ut.Utils();
        for (let className of this.classMap.keys()) {
            let content = this.classMap.get(className);
            const lines = content.split(/\r\n|\n/);
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (util.isMethod(line)) {
                    let methodCode = util.getMethod(lines, i);
                    let methodName = util.getMethodName(line);
                    let violations = this.violatesLawOfDemeter(methodCode);
                    if (violations !== 0) {
                        obj = util.updateMethodMetric(obj, className, methodName, {"numLawOfDemeterViolations": violations});
                    }
                }
            }
        }
        return obj;
    }

    // Iterates over the method's body code and counts the number of LoD violations
    violatesLawOfDemeter(methodCode) {
        let res = 0;
        const lines = methodCode.split(/\r\n|\n/);
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim().split(".");
            // If there is a chain detected (LoD might be violated)
            if (line.length > 1) {
                for (let i = 1; i < line.length; i++) {
                    // LoD is violated when we have a().b(); (with or without semicolon).
                    // This is checked by seeing if a line has a method chain of 2 or more.
                    // If a line violates it, we count that as one violation, even if it's a().b().c().d();
                    if ((line[i].endsWith(")") || line[i].endsWith(");")) && line[i-1].endsWith(")")) {
                        res++;
                        break
                    }
                }
            }
        }
        return res;
    }
}