import * as la from './LinesAnalyzer.js'
import * as na from './NestingAnalyzer.js'
import * as ut from './Utils.js'

export class Program {
    // object to write to
    obj = {"data":[]};
    classMap = new Map();
    // path to save to
    relativePath = "";
    main() {
    let test = new ut.Utils();
    let res = test.load();
    this.obj = res[0];
    this.classMap = res[1];

    // call analyzers and update obj by overriding it
        let nestingAnalyzer = new na.NestingAnalyzer();
        this.obj = nestingAnalyzer.run(this.obj, this.classMap);

        let linesAnalyzer = new la.LinesAnalyzer();
        this.obj = linesAnalyzer.run(this.obj, this.classMap);

        console.log(this.obj.data[0]);
        console.log(this.obj.data[1]);
    }
}

let test = new Program();
test.main();