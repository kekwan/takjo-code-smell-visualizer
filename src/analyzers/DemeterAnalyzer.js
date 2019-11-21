import * as fs from 'fs'

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
        for (let className of this.classMap.keys()) {
            let content = this.classMap.get(className);
            const lines = content.split(/\r\n|\n/);
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (this.isMethod(line)) {
                    let methodCode = this.getMethod(lines, i);
                    let methodName = this.getMethodName(line);
                    let methodParameters = this.getMethodParameters(); // double check what it's called/returning
                    let res = this.violatesLawOfDemeter(methodName, methodCode)[0];
                    let violates = res[0];
                    let violations = res[1];
                    if (violates) {
                        // update obj
                    }
                }
            }
        }
    }

    violatesLawOfDemeter(methodName, methodParameters, methodCode) {
        // FOR LINE IN METHODCODE:
        let currentClasses = [];
        const lines = methodCode.split(/\r\n|\n/);
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim().split(" ");

            // IF LINE HAS foo = new Foo(); ADD IT TO CURRENTCLASSES
            if (line[line.length-2] === "new") {
                currentClasses.push(line[line.length-4]);
            } else if ()
            // IF LINE HAS OTHERCLASS.OTHERMETHOD()
            // (1) it's okay to call our own methods
                if (/*OTHERCLASS in methodParameters*/) {
                    return false;
                } else if (/*OTHERCLASS in CURRENTCLASSES*/) {
                    return false;
                }

            // (2) it's okay to call methods on objects passed in to our method
            int
            price = pizza.getPrice();

            // (3) it's okay to call methods on any objects we create
            cheeseTopping = new CheeseTopping();
            float
            weight = cheeseTopping.getWeightUsed();

            // (4) any directly held component objects
            foo.doBar();
            // IF LINE HAS OTHERMETHOD()
            return /*OTHERMETHOD in own class*/;
        }
    }
}