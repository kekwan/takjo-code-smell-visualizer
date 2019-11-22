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
        let map = this.loadJavaFiles();
        this.populateObj(obj);
        return [obj, map];
    }

    /**
     * Loads java files found in the input directory and stores it in memory
     * @returns {Map<string, string>}
     * key: <fileName>.java
     * value: file content (code)
     */
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
                "classSize": null,
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

    // helper
    getMetricArray(data, className){
        let index = data.findIndex(function (methodObj) {
            return methodObj.className === className;
        });
        return data[index].methodMetrics;
    }
}