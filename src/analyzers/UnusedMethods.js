/**
 * Read all files sequentially
 * For each file, store all methods and function calls / declarations to other classes.
 * Go through each "file", see what class / method is referenced/called and increment the count to the respective method.
 * 
 * Methods which have the initial counter (0) means that it's unused.
 */

import * as fs from 'fs';

export default class UnusedMethods {
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
        // obj = this.unusedMethodsCheck(obj);
        return obj;
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
					
					// Find if this method refers to any other methods
					let calls = this.getCalls(methodCode, methodName, className);
					if (calls.length > 0) {
						this.store[className]["calls"] = this.store[className]["calls"].concat(calls);
					}
                }
            }
		}
		
		// Process our stores to see which method is called.
    }

	// Populates store with all methods and method references.
	getCalls(methodCode, methodName, className) {
        let util = new ut.Utils();

		const regex = /(\w*\.\w*\(.*\))/gm;
		let lines = methodCode.split("\n");
		for (let i = 0; i < lines.length; i++) {
			// For each line
			let line = lines[i].split("=");
			let callingCode = line[line.length - 1];
			while ((m = regex.exec(callingCode)) !== null) {
				// This is necessary to avoid infinite loops with zero-width matches
				if (m.index === regex.lastIndex) {
					regex.lastIndex++;
				}
				
				// The result can be accessed through the `m`-variable.
				m.forEach((match, groupIndex) => {
					console.log(`Found match, group ${groupIndex}: ${match}`);
					this.store[className]["methods"][methodName].push(match);
				});
			}
		}
	}
	
}