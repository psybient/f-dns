const LangHelper =  class  {
    constructor() {
    }
    isUnicode(str) {
        var letters = [];
        for (var i = 0; i <= str.length; i++) {
            letters[i] = str.substring((i - 1), i);
            if (letters[i].charCodeAt() > 255) { return true; }
        }
        return false;
    }
}

export const Lang = new LangHelper();