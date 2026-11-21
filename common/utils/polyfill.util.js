export const detectBrowserIsIe = function () {
    if (/MSIE 10/i.test(navigator.userAgent)) {
        // This is internet explorer 10
        //window.alert('isIE10');
        return 'isIE10';
    }

    if (/MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent)) {
        // This is internet explorer 9 or 11
        //window.location = 'pages/core/ie.htm';
        return 'isIE9';
    }

    if (/Edge\/\d./i.test(navigator.userAgent)) {
        // This is Microsoft Edge
        //window.alert('Microsoft Edge');
        return 'isEdge'
    }
    return false;
}


export function isStorageSupported(globalObject, storageType) {
    try {
        const storage = globalObject[storageType];
        storage.setItem("test", "test");
        storage.removeItem("test");
        return true;
    } catch (err) {
        return false;
    }
}

//Usage : isStorageSupported(window, "localStorage");