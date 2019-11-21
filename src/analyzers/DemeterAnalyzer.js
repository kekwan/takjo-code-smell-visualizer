import * as ut from "./Utils";

export class DemeterAnalyzer{
    relativePath = "../input/";
    // key is string fileName.java, value is a string which is file content;
    classMap = new Map();

    run(obj, map) {
        this.classMap = map;
        obj = this.lawOfDemeterCheck(obj);
        return obj;
    }

    // Read files and check if they violate demeter
    // code similar to readFiles but instead of checking for for-loop
    // we check for
    lawOfDemeterCheck(obj) {
        let util = new ut.Utils();
        for (let className of this.classMap.keys()) {
            let content = this.classMap.get(className);
            const lines = content.split(/\r\n|\n/);
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (this.isMethod(line)) {
                    let methodCode = this.getMethod(lines, i);
                    let methodName = this.getMethodName(line);
                    let violations = this.violatesLawOfDemeter(methodCode);
                    if (violations != 0) {
                        util.updateMethodMetric(obj, className, methodName, {"lawOfDemeter": violations});
                    }
                }
            }
        }
    }

    violatesLawOfDemeter(methodCode) {
        let res = 0;
        const lines = methodCode.split(/\r\n|\n/);
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim().split(".");
            // If there is a chain detected (LoD might be violated)
            if (line.length > 1) {
                for (let i = 1; i < line.length; i++) {
                    // If we see [..., "someMethod()", "chainedMethod(), ..."] => someMethod().chainedMethod()
                    // Only a violation if we see parens, cuz it's methodCall().methodCall()
                    if (line[i].match(/\w+[(](\w*[,\w])*[)]/g).length > 0 &&
                        line[i-1].match(/\w+[(](\w*[,\w])*[)]/g).length > 0) {
                        res++;
                    }
                }
            }
        }
    }
}