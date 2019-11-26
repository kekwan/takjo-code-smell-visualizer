import * as fs from "fs";

export class Utils {
    relativePath = "../input/";
    classMap = new Map();

    /**
     * Loader method, call this in Program.js in main() function
     * loads the java files and populates the data obj
     */
    load() {
        let obj = {"data": []};
        let map = this.loadJavaFiles(this.relativePath);
        this.populateObj(obj);
        return [obj, map];
    }

    /**
     * Loads java files found in the input directory and stores it in memory
     * @returns {Map<string, string>}
     * key: <fileName>.java
     * value: file content (code)
     */
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
        return this.classMap;
    }

    /**
     * populates the data object
     * @param obj
     */
    populateObj(obj) {
        let arr = [];
        let id = 0;
        for (let className of this.classMap.keys()) {
            id++;
            let classObj = {
                "id": id,
                "className": className.split('.')[0],
                "classSize": -1,
                "codeSmellScore": -1,
                "numOfUnusedMethods": 0,
                "methodMetrics": []
            };
            arr.push(classObj);
        }
        obj.data = arr;
    }

    /**
     *
     * @param obj: the data object
     * @param className : string
     * @param size : int the value to be updated
     * @returns a new data object, assign the previous one with this value
     */
    updateClassMetric(obj, className, size) {
        if (className.includes('.java')) {
            className = className.split('.')[0];
        }
        let index = obj.data.findIndex(function (classObj) {
            return classObj.className === className;
        });
        obj.data[index].classSize = size;
        return obj;
    }

    /**
     *
     * @param obj: data object
     * @param className : string
     * @param methodName : string
     * @param attributes : object with attributes to be added/updated
     * @returns a new data object, assign the previous one with this value
     */
    updateMethodMetric(obj, className, methodName, attributes) {
        if (className.includes('.java')) {
            className = className.split('.')[0];
        }
        let updateIndex = obj.data.findIndex(function (classObj) {
            return classObj.className === className;
        });
        let classObj = obj.data[updateIndex];
        let index = classObj.methodMetrics.findIndex(function(methodMetric) {
            return methodMetric.methodName === methodName;
        });
        if (index !== -1) {
            let oldObj = classObj.methodMetrics[index];
            Object.assign(oldObj, attributes);
            classObj.methodMetrics[index] = oldObj;
            return obj;
        } else {
            let newObj = {
                "methodName": methodName,
            };
            Object.assign(newObj, attributes);
            classObj.methodMetrics.push(newObj);
            return obj;
        }
    }

    // return 0 if there's no curly brackets on this line
    // return 1 if there's an '{' on this line
    // return -1 if there's an '}' on this line
    isBracket(line) {
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

    calculateWeight(obj) {
        let data = obj.data;
        let goodCSize = 900;
        let score = 0;
        let numOfUnusedMethods = 0;
        for (let classObj of data) {
            let numOfMethods = classObj.methodMetrics.length;
            if (numOfMethods === 0) {
                score = 8;
                classObj.codeSmellScore = score;
            } else {
            score = ((classObj.classSize) / goodCSize) + this.calculateWeightHelper(classObj.methodMetrics);
            classObj.codeSmellScore = Math.ceil(score);
            numOfUnusedMethods = this.countUnusedMethods(classObj.methodMetrics);
            classObj.numOfUnusedMethods = numOfUnusedMethods;
            }
        }
        return obj;
    }

    countUnusedMethods(methods) {
        let unusedCount = 0 ;
        for (let method of methods) {
            if (method.isUnused) {
                unusedCount++;
            }
        }
        return unusedCount;
    }
    calculateWeightHelper(methods) {
        let weight = 0;
        let numOfMethods = methods.length;
        let badSizeCount = 0;
        let badParamCount = 0;
        let badDepthCount = 0;
        let badLodCount = 0;
        let unusedCount = 0 ;
        for (let method of methods) {
            if (method.numLines > 30) {
                badSizeCount++;
            }
            if (method.numParams > 4) {
                badParamCount++;
            }
            if (method.isUnused) {
                unusedCount++;
            }
            if (method.maxNestedDepth > 3) {
                badDepthCount++;
            }
            if (method.lawOfDemeter > 3) {
                badLodCount++;
            }
        }
        weight = (badSizeCount / numOfMethods) * 2 +
                 (badParamCount / numOfMethods) * 2 +
                 (unusedCount / numOfMethods) * 2 +
                 (badDepthCount / numOfMethods) * 4 +
                 (badLodCount / numOfMethods) * 2;

        return weight;
    }
        // helper
    getMetricArray(data, className){
        let index = data.findIndex(function (methodObj) {
            return methodObj.className === className;
        });
        return data[index].methodMetrics;
    }
}