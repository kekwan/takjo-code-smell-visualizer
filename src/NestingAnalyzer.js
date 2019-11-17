const fs = require('fs');
class NestingAnalyzer {

    /*
    * FileName
    * ClassName
    * MethodName [All Methods]
    * # of methods [total]
    * # of methods that contain bad deep nesting
    * # of methods that contain nesting [total]
    * Nesting Count [all methods]
    * */
    data = [];
    relativePath = "../input/";
    // key is string fileName.java, value is a string which is file content;
    classMap = new Map();

    // key is string methodName, value is a string which is the method content;
    forLoopMethodMap = new Map();

    // Key is className
    // Total # of methods that contain nesting
    // # of methods that contain bad deep nesting
    // weight
    // fileName in which class was found
    badNestingObj;

    loadJavaFiles(path) {
        let files = fs.readdirSync(path);
        for (let file of files) {
            let extension = file.split(".").pop();
            if (fs.statSync(path + file).isFile() && extension === 'java') {
                let fileData = fs.readFileSync(path + file, 'utf8');
                this.classMap.set(file, fileData);
            } else if (fs.statSync(path + file).isDirectory()) {
                this.loadJavaFiles(path + file + '/');
            }
        }
    }

    // read all files in classMap and calls
    // the appropriate analyzer based on keyword if or for
    readFiles() {
        for (let className of this.classMap.keys()) {
            let content = this.classMap.get(className);
            const lines = content.split(/\r\n|\n/);
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (this.isClass(line)) {
                    // todo; stretch goal
                } else if (this.isMethod(line)) {
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
    isClass(line) {
        let visibility = ['public', 'private', 'protected'];
        let strArray = line.split(" ");
        if (strArray.length > 2) {
            return visibility.includes(strArray[0]) && strArray[1] === 'class';
        }
        return false;
    }


    getMethodName(line) {
        let strArray = line.split(" ");
        for (let str of strArray) {
            if (str.includes('('))
                return str.split('(')[0];
        }
    }

    isForLoop(line) {
        let strArray = line.split(" ");
        if (strArray.length > 0) {
            return strArray[0] === 'for';
        }
        return false;
    }

    isIfStatement(line) {

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

    hasForLoop(methodCode) {
        let lines = methodCode.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].split(" ");
            if (line[0] === 'for')
                return true;
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
}

let test = new NestingAnalyzer();
//test.getClassData();
//test.getMethod();
test.loadJavaFiles('../input/');
//test.readFiles();