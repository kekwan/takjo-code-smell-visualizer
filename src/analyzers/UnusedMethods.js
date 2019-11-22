/**
 * Read all files sequentially
 * For each file, store all methods and function calls / declarations to other classes.
 * Go through each "file", see what class / method is referenced/called and increment the count to the respective method.
 * 
 * Methods which have the initial counter (0) means that it's unused.
 */

import * as ut from './Utils.js';

export class UnusedMethods {
	relativePath = "../input/";
    classMap = new Map();
	/**
	 * {node
	 *   "exampleClass": {
	 *     "methods": {
	 * 	      "method1": false, // false = unused
	 *     }
	 *     "calls": []
	 *   }
	 * }
	 */
	store = {}

	// Modifies the shared JSON Object. Makes a Slice/Map of Unused methods in each class.
	// Goes through the JSON Object and modifies it if necessary
	run(obj, map) {
		this.classMap = map;
		obj = this.unusedMethodsCheck(obj);
        return obj;
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
	
	getMethodName(line) {
        let strArray = line.split(" ");
        for (let str of strArray) {
            if (str.includes('('))
                return str.split('(')[0];
        }
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
	
	unusedMethodsCheck(obj) {
        let util = new ut.Utils();
        for (let className of this.classMap.keys()) {

			// Add className to internal store
			this.store[className] = {
				"methods": {},
				"calls": [],
			};

            let content = this.classMap.get(className);
            const lines = content.split(/\r\n|\n/);
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (this.isMethod(line)) {
                    let methodCode = this.getMethod(lines, i);
                    let methodName = this.getMethodName(line);
					
					// All methods are currently unused
					this.store[className]["methods"][methodName] = false;
					
					// Find all calls to other methods in said method.
					this.getCalls(methodCode, className);
                }
            }
		}
		
		// Process our stores to see which method is called.
		let storeKeys = Object.keys(this.store)
		for (let className of this.classMap.keys()) {
			// For each class' calls, iterate whole object again and mark those called.

			let callsFromClass = this.store[className]["calls"]
			if(callsFromClass.length > 0) {
				for (className of storeKeys) {
					// Access the methods object for said class
					let methodsObj = this.store[className]["methods"]
					for (let key in methodsObj) {
						let el = callsFromClass.find(a => a.includes(key))
						if (el) {
							this.store[className]["methods"][key] = true;
						}
					}
				}
			}
		}

		// Alter the object to insert unused methods
		for (let className of this.classMap.keys()) {
			let methodsObj = this.store[className]["methods"]
			for (let methodName in methodsObj) {
				let isUsed = methodsObj[methodName]
				console.log(isUsed)
				obj = util.updateMethodMetric(obj, className, methodName, {"isUnused": !isUsed});
			}
		}

		return obj;

    }

	// Populates store with all methods and method references.
	getCalls(methodCode, className) {
		const regex = /(\w*\.\w*\(.*?\))/gm;
		let lines = methodCode.split("\n");
		for (let i = 0; i < lines.length; i++) {
			// For each line

			// If line is a comment, skip it
			if (lines[i].indexOf("//") > -1 || lines[i].indexOf("*") > -1) {
				continue;
			}

			let line = lines[i].split("=");
			let callingCode = line[line.length - 1];
			let m;
			while ((m = regex.exec(callingCode)) !== null) {
				// This is necessary to avoid infinite loops with zero-width matches
				if (m.index === regex.lastIndex) {
					regex.lastIndex++;
				}
				
				// The result can be accessed through the `m`-variable.
				m.forEach((match, groupIndex) => {
					// console.log(`Found match, group ${groupIndex}: ${match}`);
					this.store[className]["calls"].push(match);
				});
			}
		}
	
		// Remove Duplicates
		this.store[className]["calls"] =  [...new Set(this.store[className]["calls"])];
		// Remove complex calls (chained)
		this.store[className]["calls"] = this.store[className]["calls"].filter(x => x.charAt(0) != ".");
	}
	
}