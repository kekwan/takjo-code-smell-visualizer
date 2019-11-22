import * as fs from 'fs'
import * as ut from './Utils.js';

export class NestingAnalyzer {
    relativePath = "../input/";
    classMap = new Map();

    run(obj, map) {
        this.classMap = map;
        obj = this.readFiles(obj);
        return obj;
    }

    // read all files in classMap and calls
    // the appropriate analyzer based on keyword if or for
    readFiles(obj) {
        let util = new ut.Utils();
        for (let className of this.classMap.keys()) {
            let cname = className.split('.')[0];
            let attributes = null;
            let content = this.classMap.get(className);
            const lines = content.split(/\r\n|\n/);
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (util.isMethod(line)) {
                    let methodCode = util.getMethod(lines, i);
                    let methodName = util.getMethodName(line);
                    if (this.hasForLoop(methodCode)) {
                        let depthCount = this.loopAnalyzer(methodCode);
                        attributes = {"maxNestedDepth": depthCount};
                        obj = util.updateMethodMetric(obj, cname, methodName, attributes);
                    } else {
                        attributes = {"maxNestedDepth": 0};
                        obj = util.updateMethodMetric(obj, cname, methodName, attributes);
                    }
                }
            }
        }
        return obj;
    }

    loopAnalyzer(methodCode) {
        let lines = methodCode.split('\n');
        let depthCount = 0;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (this.isForLoop(line)){
                let res = this.loopAnalyzerHelper(lines, i);
                i = res[0];
                depthCount = res[1];
            }
        }
        return depthCount;
    }

    loopAnalyzerHelper(lines, index) {
        let util = new ut.Utils();
        let bracketStack = [];
        let depthCount = 0;
        let count = 0;
        let maxDepthCount = 0;
        for (let i = index; i < lines.length; i++) {
            let line = lines[i];
            let bracketCodeList = util.isBracket(line);

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
      //  console.log(maxDepthCount);
    //    console.log(depthCount);
        return [count, depthCount];
    }

    // determines if this line contains a for loop procedure
    isForLoop(line) {
        let strArray = line.split(" ");
        if (strArray.length > 0) {
            return strArray[0] === 'for';
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
}

//let test = new NestingAnalyzer();
//test.getClassData();
//test.getMethod();
//test.loadJavaFiles('../input/');
//test.readFiles();