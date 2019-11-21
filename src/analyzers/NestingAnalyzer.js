import * as fs from 'fs'
export class NestingAnalyzer {
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

    // read all files in classMap and calls
    // the appropriate analyzer based on keyword if or for
    readFiles(obj) {
        for (let className of this.classMap.keys()) {
            let content = this.classMap.get(className);
            const lines = content.split(/\r\n|\n/);
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (this.isMethod(line)) {
                    let methodCode = this.getMethod(lines, i);
                    let methodName = this.getMethodName(line);
                    if (this.hasForLoop(methodCode)) {
                        this.loopAnalyzer(methodCode);
                    }
                }
            }
        }
    }

    loopAnalyzer(methodCode) {
        let lines = methodCode.split('\n');
        let depthCount = 0;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (this.isForLoop(line)){
                let res = this.loopAnalyzerHelper(lines, i);
                i = res[0];
            }
        }
    }

    loopAnalyzerHelper(lines, index) {
        let bracketStack = [];
        let depthCount = 0;
        let count = 0;
        let maxDepthCount = 0;
        for (let i = index; i < lines.length; i++) {
            let line = lines[i];
            let bracketCodeList = this.isBracket(line);

            if (bracketStack.length === 0 && this.isForLoop(line)) {
                if (maxDepthCount < depthCount) {
                    maxDepthCount = depthCount;
                }
                depthCount = 0;
            }

            for (let code of bracketCodeList) {
                if (code === 1)
                    bracketStack.push('{');
                if (code === -1)
                    bracketStack.pop();

            }

            if (bracketStack.length !== 0 && i !== index && this.isForLoop(line)) {
                depthCount++;
            }

            count = i;
        }
        console.log(maxDepthCount);
    //    console.log(depthCount);
        return [count, depthCount];
    }

    // return 0 if there's no curly brackets on this line
    // return 1 if there's an '{' on this line
    // return -1 if there's an '}' on this line
    isBracket(line) {
     //   console.log(line);
        let tokenizedLine = line.split(" ");
        let result = [];
        for (let letter of tokenizedLine) {
            if (letter === '{') {
                result.push(1);
            } else  if (letter === '}') {
                result.push(-1)
            }
        }
        return result;
    }

    // returns true if this line declares a class
    isClass(line) {
        let visibility = ['public', 'private', 'protected'];
        let strArray = line.split(" ");
        if (strArray.length > 2) {
            return visibility.includes(strArray[0]) && strArray[1] === 'class';
        }
        return false;
    }

    // gets the methodName on this line
    getMethodName(line) {
        let strArray = line.split(" ");
        for (let str of strArray) {
            if (str.includes('('))
                return str.split('(')[0];
        }
    }

    // determines if this line contains a for loop procedure
    isForLoop(line) {
        let strArray = line.split(" ");
        if (strArray.length > 0) {
            return strArray[0] === 'for';
        }
        return false;
    }

    // determines if this line contains an if statement
    isIfStatement(line) {
        let strArray = line.split(" ");
        if (strArray.length > 0) {
            return strArray[0] === 'if';
        }
        return false;
    }

    // true if this line is a method definition
    // false otherwise
    isMethod(line) {
        let visibility = ['public', 'private', 'protected'];
        let keywords = ['class', 'abstract', 'interface', 'enum'];
        let strArray = line.split(" ");
        if (strArray.length > 2) {
            return visibility.includes(strArray[0]) && !keywords.includes(strArray[1]) && line[line.length - 1] !== ";";
        }
        return false;
    }

    // determines if the methodCode contains a for loop procedure
    hasForLoop(methodCode) {
        let lines = methodCode.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].split(" ");
            if (line[0] === 'for')
                return true;
        }
        return false;
    }


    // gets the content (code) of the method
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
}

//let test = new NestingAnalyzer();
//test.getClassData();
//test.getMethod();
//test.loadJavaFiles('../input/');
//test.readFiles();