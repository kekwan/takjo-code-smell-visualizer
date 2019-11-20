import * as na from "./NestingAnalyzer.js"

class Program {
    // object to write to
    obj = {"data":[]};
    // path to save to
    relativePath = "";
    main() {
    let test = new na.NestingAnalyzer();
    test.run(this.obj);
    }
}

let test = new Program();
test.main();