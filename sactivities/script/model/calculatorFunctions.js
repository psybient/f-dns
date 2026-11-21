export function CalculateExamPercent(gradeFieldId, rightCount, wrongCount, blankCount) {
    let hasNegativeScore = (gradeFieldId > 6);
    if (hasNegativeScore)
        return parseFloat((((rightCount - (wrongCount / 3)) / (rightCount + wrongCount + blankCount)) * 100).toFixed(2));
    else
        return parseFloat(((rightCount / (rightCount + wrongCount + blankCount)) * 100).toFixed(2));
}

export function CalculateExamPercentAverage(percentList) {
    if (percentList.length == 0)
        return 0;
    var sum, avg = 0;
    if (percentList.length) {
        sum = percentList.reduce(function (a, b) { return a + b; });
        avg = sum / percentList.length;
    }
    return parseFloat(avg.toFixed(2));
}

export function CalculateExamPercentAverageByExamType(list) {

    var percentList = [];
    list.reduce(function (res, value) {
        if (!res[value.examTypeId]) {
            res[value.examTypeId] = {
                examTypeId: value.examTypeId,
                percent: value.percent
            };
            percentList.push(value.percent)
        }
        return res;
    }, {});

    // var percentList = list.map(function (item) { return item.percent; });
    if (percentList.length == 0)
        return 0;
    var sum, avg = 0;
    if (percentList.length) {
        sum = percentList.reduce(function (a, b) { return a + b; });
        avg = sum / percentList.length;
    }
    return parseFloat(avg.toFixed(2));
}

export function LevelDetection(percent) {
    if (percent >= 85)
        return 51;
    else if (percent >= 55 && percent < 85)
        return 50;
    else if (percent >= 25 && percent < 55)
        return 49;
    else
        return 48;
}

