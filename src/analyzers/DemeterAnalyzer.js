import * as fs from 'fs'
import * as utils from './Utils.js'

export class DemeterAnalyzer{
    relativePath = "../input/";
    // key is string fileName.java, value is a string which is file content;
    classMap = new Map();

    run(obj) {
        this.loadJavaFiles(this.relativePath);
        this.readFiles(obj);
        return obj;
    }

    // load java files in path and store it to classMap
    loadJavaFiles() {
        let files = fs.readdirSync(this.relativePath);
        for (let file of files) {
            let extension = file.split(".").pop();
            if (fs.statSync(this.relativePath + file).isFile() && extension === 'java') {
                let fileData = fs.readFileSync(this.relativePath + file, 'utf8');
                this.classMap.set(file, fileData);
            } else if (fs.statSync(this.relativePath + file).isDirectory()) {
                this.loadJavaFiles(this.relativePath + file + '/');
            }
        }
        console.log(this.classMap.keys())
    }


    // Read files and check if they violate demeter
    // code similar to readFiles but instead of checking for for-loop
    // we check for
    lawOfDemeterCheck(obj) {
        let numViolations = 0;
        for (let className of this.classMap.keys()) {
            let content = this.classMap.get(className);
            const lines = content.split(/\r\n|\n/);
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (this.isMethod(line)) {
                    let methodCode = this.getMethod(lines, i);
                    let methodName = this.getMethodName(line);
                    if (this.violatesLawOfDemeter(methodCode)) {
                        utils.updateMethodMetric(obj, className, methodName, {"lawOfDemeter": 1});
                    }
                }
            }
        }
    }

    violatesLawOfDemeter(methodCode) {
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
                        return true;
                    }
                }
            }
        }
    }
}