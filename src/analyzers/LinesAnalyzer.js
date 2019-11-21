import * as fs from 'fs'
import * as na from "./NestingAnalyzer.js"

export class LinesAnalyzer {
    relativePath = "../input/";
    // key is string fileName.java, value is a string which is file content;
    classMap = new Map();

    run(obj) {
        this.loadJavaFiles(this.relativePath);
        this.readFiles(obj);
        return obj;
    }

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

    readFiles(obj) {
        for (let className of this.classMap.keys()) {
            let content = this.classMap.get(className);
            const lines = content.split(/\r\n|\n/);
            
            let classCode = this.getClassCode(lines);
            let classMethods = 0;
            
            let classLines = classCode.split(/\r\n|\n/);
            for (let i = 0; i < classLines.length; i++) {
                let line = classLines[i].trim();
                if (this.isMethod(line)) {
                    classMethods++;
                    let methodCode = this.getMethod(classLines, i);
                    let methodName = this.getMethodName(line);
                    let methodLines = this.getNumberOfLines(methodCode);
                    let methodParameters = this.getMethodParameters(methodCode).length;
                    console.log("This Method", methodName, "has this number of lines", methodLines);
                    console.log("This Method", methodName, "has this number of parameters", methodParameters);
                }
            }
            console.log("linesAnalyzer's has this many class Lines", classLines.length);
            console.log("linesAnalyzer's has this many class Methods", classMethods);
        }
    }

    isMethod(line) {
        let visibility = ['public', 'private', 'protected'];
        let keywords = ['class', 'abstract', 'interface', 'enum'];
        let strArray = line.split(" ");
        if (strArray.length > 2) {
            return visibility.includes(strArray[0]) && !keywords.includes(strArray[1]) && line[line.length - 1] !== ";";
        }
        return false;
    }

    getMethod(lines, index) {
        let methodContent = '';
        for (let i = index; i < lines.length; i++){
            let line = lines[i].trim();
            if (this.isMethod(line) && i !== index) {
                return methodContent;
            } else {
                if (!line.includes("@Override"))
                    methodContent += line + '\n';
            }
        }
        return methodContent.trim();
    }

    isClass(line) {
        let visibility = ['public', 'private', 'protected'];
        let strArray = line.split(" ");
        if (strArray.length > 2) {
            return visibility.includes(strArray[0]) && strArray[1] === 'class';
        }
        return false;
    }

    getClass(lines, index) {
        let classContent = '';
        for (let i = index; i < lines.length; i++){
            let line = lines[i].trim();
            if (this.isClass(line) && i !== index) {
                return classContent;
            } else {
                classContent += line + '\n';
            }
        }
        return classContent.trim();
    }

    getClassCode(lines) {
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (this.isClass(line)) {
                let classCode = this.getClass(lines, i);
                return classCode;
            }
        }
    }

    getMethodName(line) {
        let strArray = line.split(" ");
        for (let str of strArray) {
            if (str.includes('('))
                return str.split('(')[0];
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