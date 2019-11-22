import * as da from './DemeterAnalyzer.js'
import * as la from './LinesAnalyzer.js'
import * as na from './NestingAnalyzer.js'
import * as uma from './UnusedMethodsAnalyzer.js'
import * as ut from './Utils.js'
import * as fs from 'fs';

export class Program {
    // object to write to
    obj = {"data":[]};
    classMap = new Map();
    // path to save to
    relativePath = "../metrics/test" + Date.now() +".json";
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

        let demeterAnalyzer = new da.DemeterAnalyzer();
        this.obj = demeterAnalyzer.run(this.obj, this.classMap);

        let unusedMethodsAnalyzer = new uma.UnusedMethodsAnalyzer();
        this.obj = unusedMethodsAnalyzer.run(this.obj, this.classMap);

        // todo use fs-extra to ensuredir
        fs.writeFileSync(this.relativePath, JSON.stringify(this.obj, null, '\t'));
    }
}

let run = new Program();
run.main();