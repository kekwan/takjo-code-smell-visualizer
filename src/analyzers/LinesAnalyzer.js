import * as ut from './Utils.js';

export class LinesAnalyzer {
    relativePath = "../input/";
    classMap = new Map();

    run(obj, map) {
        this.classMap = map;
        obj = this.readFiles(obj);
        return obj;
    }

    readFiles(obj) {
        let util = new ut.Utils();
        let attributes = null;

        for (let className of this.classMap.keys()) {
            let cname = className.split('.')[0];
            let content = this.classMap.get(className);
            const lines = content.split(/\r\n|\n/);
            
            let classCode = this.getClassCode(lines);
            let classMethods = 0;
            
            let classLines = classCode.split(/\r\n|\n/);
            for (let i = 0; i < classLines.length; i++) {
                let line = classLines[i].trim();
                if (util.isMethod(line)) {
                    classMethods++;
                    let methodCode = util.getMethod(classLines, i);
                    let methodName = util.getMethodName(line);
                    let methodLines = this.getNumberOfLines(methodCode);
                    let methodParameters = this.getMethodParameters(methodCode).length;
                    attributes = {"numLines": methodLines};
                    obj = util.updateMethodMetric(obj, cname, methodName, attributes);
                    attributes = {"numParams": methodParameters};
                    obj = util.updateMethodMetric(obj, cname, methodName, attributes);
                }
            }
            let size = classLines.length * classMethods;
            obj = util.updateClassMetric(obj, cname, size);
        }
        return obj;
    }

    getClass(lines, index) {
        let classContent = '';
        let util = new ut.Utils();
        for (let i = index; i < lines.length; i++){
            let line = lines[i].trim();
            if (util.isClass(line) && i !== index) {
                return classContent;
            } else {
                classContent += line + '\n';
            }
        }
        return classContent.trim();
    }

    getClassCode(lines) {
        let util = new ut.Utils();
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (util.isClass(line)) {
                let classCode = this.getClass(lines, i);
                return classCode;
            }
        }
    }

    getNumberOfLines(methodCode) {
        let lines = methodCode.split(/\r\n|\n/);
        return lines.length;

    }

    getMethodParameters(methodCode) {
        let parameterNames = [];
        let methodlines = methodCode.split(")");
        let params = methodlines[0].split(",");
        for (let param of params) {
            param = param.split(" ");
            parameterNames.push(param[param.length-1]);
        }
        return parameterNames;
    }

}