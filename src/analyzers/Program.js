import * as na from "./Utils.js"

class Program {
    // object to write to
    obj = {"data":[]};
    classMap = new Map();
    // path to save to
    relativePath = "";
    main() {
    let test = new na.Utils();
    let res = test.load();
    this.obj = res[0];
    this.classMap = res[1];

    // call analyzers and update obj by overriding it
    }
}

let test = new Program();
test.main();
