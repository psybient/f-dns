//import _ from 'lodash';
import { before, forEach, sample } from 'lodash';
import { CalculateExamPercent, CalculateExamPercentAverage, LevelDetection } from './calculatorFunctions';

export function GetRowsICollection(baseData) {
    var rowLevelI = [];
    baseData.reduce(function (res, value) {
        if (!res[value.gradeFieldId]) {
            res[value.gradeFieldId] = {
                gradeFieldId: value.gradeFieldId,
                gradeFieldCaption: value.gradeFieldCaption,
                // parent: "#",
                uniqueId: value.gradeFieldId + ","
            };
            rowLevelI.push(res[value.gradeFieldId])
        }
        return res;
    }, {});

    //console.log(rowLevelI);
    return rowLevelI; //.reduce((acc, it) => (acc[it.gradeFieldId] = it, acc), {});
}

export function GetRowsIIICollection(baseData, baseGrades) {
    var rowLevelIII = [];
    //for (const [key, value] of Object.entries(baseGrades)) {
    forEach(baseGrades, item => {
        var croot = baseData.filter(i => i.gradeFieldId == item.gradeFieldId);
        croot.reduce(function (res, value) {
            if (!res[value.gradeFieldId + ',' + value.gradeLessonDetailId]) {
                res[value.gradeFieldId + ',' + value.gradeLessonDetailId] = {
                    id: value.gradeLessonDetailId,
                    gradeLessonDetailId: value.gradeLessonDetailId,
                    duration: 0,
                    lessonCaption: value.lessonCaption,
                    leafCount: value.leafCount,
                    readLeafCount: 0,
                    percent: null,
                    gradeFieldId: value.gradeFieldId,
                    // parent: "#",
                    uniqueId: value.gradeFieldId + "," + value.gradeLessonDetailId,
                    type: "lesson"
                };
                rowLevelIII.push(res[value.gradeFieldId + ',' + value.gradeLessonDetailId])
            }

            return res;
        });
    })

    return rowLevelIII.reduce((acc, it) => (acc[it.gradeFieldId + ',' + it.gradeLessonDetailId] = it, acc), {});
}

export function GetRowsIVCollection(baseData, baseLessons) {
    var rowLevelIV = [];

    for (const [key, value] of Object.entries(baseLessons)) {
        var croot = baseData.filter(i => (i.gradeFieldId + ',' + i.gradeLessonDetailId) == key);
        croot.reduce(function (res, value) {
            if (!res[value.gradeFieldId + ',' + value.gradeLessonDetailId + ',' + value.educationalTreeId]) {
                res[value.gradeFieldId + ',' + value.gradeLessonDetailId + ',' + value.educationalTreeId] = {
                    id: value.educationalTreeId,
                    uniqueId: value.gradeFieldId + ',' + value.gradeLessonDetailId + ',' + value.educationalTreeId,
                    gradeFieldId: value.gradeFieldId,
                    gradeLessonDetailId: value.gradeLessonDetailId,
                    educationalTreeId: value.educationalTreeId,
                    caption: value.seasonCaption + ' - ' + value.studyUnitCaption,
                    percent: null,
                    perfect: false,
                    good: false,
                    average: false,
                    weak: false,
                    duration: 0,
                    seasonSortOrder: value.seasonSortOrder,
                    sectionSortOrder: value.sectionSortOrder,
                    type: "baseEducation"
                };
                rowLevelIV.push(res[value.gradeFieldId + ',' + value.gradeLessonDetailId + ',' + value.educationalTreeId])
            }

            return res;
        }, {});
    }

    return rowLevelIV.reduce((acc, it) => (acc[it.gradeFieldId + ',' + it.gradeLessonDetailId + ',' + it.educationalTreeId] = it, acc), {});
}


export function GetRowsVCollection(baseData, baseLessons) {
    var rowLevelV = [];
    var percentArray = [];

    for (const [key, value] of Object.entries(baseLessons)) {

        var croot = baseData.filter(i => (i.gradeFieldId + ',' + i.gradeLessonDetailId) == key && i.personRoleId != 0);
        croot.reduce(function (res, value) {

            if (value.examId != 0 && !res[value.personRoleId + ',' + value.gradeLessonDetailId + ',' + value.examTypeId + ',' + value.examId + ',' + value.educationalTreeId]) {
                let cPercentIV = value.rightAnswerCount + value.wrongAnswerCount + value.blankAnswerCount == 0 ? null : CalculateExamPercent(value.gradeFieldId, value.rightAnswerCount, value.wrongAnswerCount, value.blankAnswerCount);
                let cLevelIV = cPercentIV == null ? 0 : LevelDetection(cPercentIV);
                res[value.personRoleId + ',' + value.gradeLessonDetailId + ',' + value.examTypeId + ',' + value.examId + ',' + value.educationalTreeId] = {
                    id: value.examId,
                    uniqueId: value.gradeFieldId + ',' + value.gradeLessonDetailId + ',' + value.educationalTreeId + ',' + value.examId,
                    gradeFieldId: value.gradeFieldId,
                    gradeLessonDetailId: value.gradeLessonDetailId,
                    educationalTreeId: value.educationalTreeId,
                    examId: value.examId,
                    personRoleId: value.personRoleId,
                    examDateCaption: value.examDate,
                    examTypeId: value.examTypeId,
                    examTypeCaption: value.examTypeCaption,
                    studyTypeId: value.studyTypeId,
                    studyTypeCaption: value.studyTypeCaption,
                    studyReferenceId: value.studyReferenceId,
                    studyReferenceCaption: value.studyReferenceCaption,
                    rightACount: value.rightAnswerCount,
                    wrongACount: value.wrongAnswerCount,
                    blankACount: value.blankAnswerCount,
                    difficultyId: value.difficultyLevelId,
                    perfect: (cLevelIV == 51),
                    good: (cLevelIV == 50),
                    average: (cLevelIV == 49),
                    weak: (cLevelIV == 48),
                    duration: value.duration,
                    percent: cPercentIV,
                    examdatesh: value.examDate,
                    type: 'studentTestList'
                };
                // res[value.personRoleId + ',' + value.gradeLessonDetailId + ',' + value.examTypeId + ',' + value.examId + ',' + value.educationalTreeId].duration += value.duration;
                if (cLevelIV != null)
                    percentArray.push({
                        gradeFieldId: res[value.personRoleId + ',' + value.gradeLessonDetailId + ',' + value.examTypeId + ',' + value.examId + ',' + value.educationalTreeId].gradeFieldId,
                        gradeLessonDetailId: res[value.personRoleId + ',' + value.gradeLessonDetailId + ',' + value.examTypeId + ',' + value.examId + ',' + value.educationalTreeId].gradeLessonDetailId,
                        personRoleId: res[value.personRoleId + ',' + value.gradeLessonDetailId + ',' + value.examTypeId + ',' + value.examId + ',' + value.educationalTreeId].personRoleId,
                        educationalTreeId: res[value.personRoleId + ',' + value.gradeLessonDetailId + ',' + value.examTypeId + ',' + value.examId + ',' + value.educationalTreeId].educationalTreeId,
                        examTypeId: res[value.personRoleId + ',' + value.gradeLessonDetailId + ',' + value.examTypeId + ',' + value.examId + ',' + value.educationalTreeId].examTypeId,
                        percent: res[value.personRoleId + ',' + value.gradeLessonDetailId + ',' + value.examTypeId + ',' + value.examId + ',' + value.educationalTreeId].percent,
                        examdatesh: res[value.personRoleId + ',' + value.gradeLessonDetailId + ',' + value.examTypeId + ',' + value.examId + ',' + value.educationalTreeId].examdatesh,
                        examId: res[value.personRoleId + ',' + value.gradeLessonDetailId + ',' + value.examTypeId + ',' + value.examId + ',' + value.educationalTreeId].examId,
                        duration: res[value.personRoleId + ',' + value.gradeLessonDetailId + ',' + value.examTypeId + ',' + value.examId + ',' + value.educationalTreeId].duration
                    });
                rowLevelV.push(res[value.personRoleId + ',' + value.gradeLessonDetailId + ',' + value.examTypeId + ',' + value.examId + ',' + value.educationalTreeId]);
            }
            return res;
        }, {});
    }
    return {
        V: rowLevelV,
        VPercent: percentArray
    };
}

export function GetRowsVICollection(baseData, rowsVCollection) {
    var rowLevelVI = [];
    for (const [key, value] of Object.entries(rowsVCollection)) {
        var croot = baseData.filter(i => i.examId == value.examId && i.personRoleId == value.personRoleId);

        for (var cr = 0; cr < croot.length; cr++) {
            rowLevelVI.push({
                id: croot[cr].answerId,
                personRoleId: croot[cr].personRoleId,
                uniqueId: croot[cr].gradeLessonDetailId + ',' + croot[cr].educationalTreeId + ',' + croot[cr].examId + ',' + croot[cr].answerId,
                examId: croot[cr].examId,
                answerId: croot[cr].answerId,
                difficultyLevelId: croot[cr].difficultyLevelId,
                difficultyLevelCaption: croot[cr].difficultyLevelCaption,
                studentAnswer: croot[cr].studentAnswer,
                reasonId: croot[cr].reasonId,
                reasonCaption: croot[cr].reasonCaption
            });
        }

    }
    return rowLevelVI;
}

export function generateLessonAndEduCollectionBaseOnPersonRoleId(baseData, studentsList, examPercentList, baseEdu, baseLessons) {

    let newEduList = []
    let treeEduList = []
    let newLessonsList = [];
    let newstudentsList = [];
    const stuCount = studentsList.length;

    const studentActivityCountPerLesson = GetStudentActivityCountPerLesson(baseData);

    for (var i = 0; i < stuCount; i++) {
        let value = studentsList[i];

        const EduHasPercent = (valuee) => (x) =>
            x.gradeLessonDetailId == valuee.gradeLessonDetailId &&
            x.educationalTreeId == valuee.educationalTreeId &&
            x.percent != null;

        const LessonHasPercent = (valuee) => (x) =>
            x.gradeLessonDetailId == valuee.gradeLessonDetailId &&
            x.percent != null;


        let baseEduByGrade = baseEdu.filter(x => x.gradeFieldId === value.gradeFieldId);

        let baseLessonsByGrade = baseLessons.filter(x => x.gradeFieldId === value.gradeFieldId);

        let examPercentListSpliter = examPercentList.filter(s => s.personRoleId == value.personRoleId);

        for (const valuee of baseEduByGrade) {

            let eduPercentList = examPercentListSpliter.filter(EduHasPercent(valuee));

            if (eduPercentList.length != 0) {

                const treeitem = { ...valuee };

                let treeedu = eduPercentList.sort((a, b) => (b.examdatesh.localeCompare(a.examdatesh) || b.examTypeId - a.examTypeId))[0];
                treeitem.personRoleId = value.personRoleId;
                treeitem.percent = treeedu.percent;
                let cLevel = LevelDetection(treeedu.percent);
                treeitem.perfect = (cLevel == 51);
                treeitem.good = (cLevel == 50);
                treeitem.average = (cLevel == 49);
                treeitem.weak = (cLevel == 48);
                treeitem.firstName = value.firstName;
                treeitem.lastName = value.lastName;
                treeitem.classNo = value.classNo;
                treeitem.duration = treeedu.duration;
                treeitem.examTypeId = treeedu.examTypeId;
                treeitem.examdatesh = treeedu.examdatesh;
                newEduList.push(treeitem);

                for (const edu of eduPercentList) {
                    const item = { ...valuee };
                    item.personRoleId = value.personRoleId;
                    item.percent = edu.percent;
                    let cLevel = LevelDetection(edu.percent);
                    item.perfect = (cLevel == 51);
                    item.good = (cLevel == 50);
                    item.average = (cLevel == 49);
                    item.weak = (cLevel == 48);
                    item.firstName = value.firstName;
                    item.lastName = value.lastName;
                    item.classNo = value.classNo;
                    item.duration += edu.duration;
                    item.examTypeId = edu.examTypeId;
                    item.examdatesh = edu.examdatesh;
                    treeEduList.push(item);
                }
            }
        }


        let newEduListSpliter = newEduList.filter(s => s.personRoleId == value.personRoleId);
        let baseDataSpliter = baseData.filter(s => s.personRoleId == value.personRoleId);
        for (const valuee of baseLessonsByGrade) {
            const item = { ...valuee };
            let timeDuration = 0;
            let lessonPercentList = newEduListSpliter.filter(LessonHasPercent(item))

            if (lessonPercentList.length != 0) {
                item.personRoleId = value.personRoleId;
                let cList = baseDataSpliter.filter(x => x.personRoleId == value.personRoleId && x.gradeLessonDetailId == item.gradeLessonDetailId);

                cList.reduce(function (res, v) {
                    if (!res[v.studyId]) {
                        res[v.studyId] = {
                            Id: v.studyId
                        };
                        timeDuration += v.duration;
                    }
                    return res;
                }, {});

                item.duration = timeDuration;

                let lList = baseDataSpliter.filter(x => x.personRoleId == value.personRoleId && x.gradeLessonDetailId == item.gradeLessonDetailId && x.studyGradeLessonEducationalTreeId != 0);
                if (lList.length != 0) {
                    const leafarray = [...new Set(lList.map(a => a.studyGradeLessonEducationalTreeId))]
                    item.readLeafCount = leafarray.length;
                }

                item.percent = CalculateExamPercentAverage(lessonPercentList.map(a => a.percent));
                let cLevel = LevelDetection(item.percent);
                item.perfect = (cLevel == 51);
                item.good = (cLevel == 50);
                item.average = (cLevel == 49);
                item.weak = (cLevel == 48);
                item.firstName = value.firstName;
                item.lastName = value.lastName;
                item.encryptTestPersonId = value.encryptTestPersonId;
                item.activityCount = studentActivityCountPerLesson.filter(s => 
                                                s.gradeFieldId == item.gradeFieldId && 
                                                s.gradeLessonDetailId == item.gradeLessonDetailId && 
                                                s.personRoleId == item.personRoleId)[0].activityCount;
                item.type = "studentLesson"
                newLessonsList.push(item);
            }
        }
    }


    for (const valuee of baseEdu) {
        if (treeEduList.filter(x => x.educationalTreeId == valuee.educationalTreeId).length == 0) {
            const item = { ...valuee };
            item.personRoleId = 0;
            item.percent = 0;
            let cLevel = 48;
            item.perfect = (cLevel == 51);
            item.good = (cLevel == 50);
            item.average = (cLevel == 49);
            item.weak = (cLevel == 48);
            item.firstName = '';
            item.lastName = '';
            item.classNo = 1;
            item.duration = 0;
            item.examTypeId = 44;
            item.examdatesh = '00/00/00';
            treeEduList.push(item);
        }
    }


    for (const value of studentsList) {

        value.readLeafCount = newLessonsList.filter(x => x.personRoleId == value.personRoleId).map(a => a.readLeafCount).reduce((a, b) => a + b, 0);
        // value.leafCount = newLessonsList.filter(x => x.personRoleId == value.personRoleId).map(a => a.leafCount).reduce((a, b) => a + b, 0);
        value.leafCount = studentsList.filter(x => x.personRoleId == value.personRoleId)[0].totalLeaftCount;

        value.durationBaseOnLesson = newLessonsList.filter(x => x.personRoleId == value.personRoleId).map(a => a.duration).reduce((a, b) => a + b, 0);
        value.percentBaseOnLesson = CalculateExamPercentAverage(newLessonsList.filter(x => x.personRoleId == value.personRoleId).map(a => a.percent));
        let cLevelBaseOnLesson = LevelDetection(value.percentBaseOnLesson);
        value.perfectBaseOnLesson = (cLevelBaseOnLesson == 51);
        value.goodBaseOnLesson = (cLevelBaseOnLesson == 50);
        value.averageBaseOnLesson = (cLevelBaseOnLesson == 49);
        value.weakBaseOnLesson = (cLevelBaseOnLesson == 48);

        value.durationBaseOnEdu = newEduList.filter(x => x.personRoleId == value.personRoleId).map(a => a.duration).reduce((a, b) => a + b, 0)
        value.percentBaseOnEdu = CalculateExamPercentAverage(newEduList.filter(x => x.personRoleId == value.personRoleId).map(a => a.percent));
        let cLevelBaseOnEdu = LevelDetection(value.percentBaseOnEdu);
        value.perfectBaseOnEdu = (cLevelBaseOnEdu == 51);
        value.goodBaseOnEdu = (cLevelBaseOnEdu == 50);
        value.averageBaseOnEdu = (cLevelBaseOnEdu == 49);
        value.weakBaseOnEdu = (cLevelBaseOnEdu == 48);
        value.type = "student";

        newstudentsList.push(Object.assign({}, value));
    }


    for (const valuee of baseLessons) {

        let rearrangeNewLessonsList = newLessonsList.filter(
            x => x.gradeFieldId == valuee.gradeFieldId &&
                x.gradeLessonDetailId == valuee.gradeLessonDetailId &&
                x.percent != null
        )
        if (rearrangeNewLessonsList.length > 0) {
            valuee.percent = CalculateExamPercentAverage(rearrangeNewLessonsList.map(a => a.percent));
            valuee.duration = rearrangeNewLessonsList.map(a => a.duration).reduce((a, b) => a + b, 0);
        }
    }

    //console.timeEnd("inner-2-leaf-student")

    return new Promise(resolve => resolve({
        II: newstudentsList,
        III: newLessonsList,
        IV: newEduList,
        V: treeEduList
    }));

}


export function generateStudyUnitComparisonList(studentEduList) {//, examType, gradeFieldId, fromDate, toDate, gradeLessonDetailId, classList) {

    // return (function () {
    return (props) => {
        const { examType, gradeFieldId, fromDate, toDate, gradeLessonDetailId, classList } = props;
        let filterList = [];
        if (examType === 8)
            return [];
        switch (examType) {
            case 1:
                filterList = studentEduList.filter(y => y.examTypeId != 156
                    && y.gradeFieldId == gradeFieldId
                    && y.gradeLessonDetailId == gradeLessonDetailId
                    && classList.includes(y.classNo));
                break;
            case 2:
                filterList = studentEduList.filter(y => y.examTypeId == 156
                    && y.gradeFieldId == gradeFieldId
                    && y.gradeLessonDetailId == gradeLessonDetailId
                    && classList.includes(y.classNo));
                break;
            case 4:

                var croot = studentEduList.filter(y => y.gradeFieldId == gradeFieldId
                    && y.gradeLessonDetailId == gradeLessonDetailId
                    && classList.includes(y.classNo))
                    .sort((a, b) => (b.examdatesh.localeCompare(a.examdatesh) || b.examTypeId - a.examTypeId));



                filterList = croot.reduce(function (res, value) {

                    if (!res[value.personRoleId + ',' + value.gradeFieldId + ',' + value.gradeLessonDetailId + ',' + value.educationalTreeId]) {
                        res[value.personRoleId + ',' + value.gradeFieldId + ',' + value.gradeLessonDetailId + ',' + value.educationalTreeId] = {
                            caption: value.caption,
                            classNo: value.classNo,
                            duration: value.duration,
                            educationalTreeId: value.educationalTreeId,
                            examdatesh: value.examdatesh,
                            examTypeId: value.examType,
                            firstName: value.firstName,
                            good: value.good,
                            gradeFieldId: value.gradeFieldId,
                            gradeLessonDetailId: value.gradeLessonDetailId,
                            id: value.id,
                            lastName: value.lastName,
                            percent: value.percent,
                            perfect: value.perfect,
                            personRoleId: value.personRoleId,
                            seasonSortOrder: value.seasonSortOrder,
                            sectionSortOrder: value.sectionSortOrder
                        };
                    }
                    else {
                        res[value.personRoleId + ',' + value.gradeFieldId + ',' + value.gradeLessonDetailId + ',' + value.educationalTreeId].duration += value.duration;
                    }
                    return res;
                }, {});


                filterList = [...Object.values(filterList)]
                break;
        }

        let reduceResult = filterList.reduce(function (res, value) {
            if (!res[value.educationalTreeId]) {
                res[value.educationalTreeId] = {
                    id: value.educationalTreeId,
                    caption: value.caption,
                    studentCount: 0,
                    duration: 0,
                    percent: 0,
                    seasonSortOrder: value.seasonSortOrder,
                    sectionSortOrder: value.sectionSortOrder,
                    captionSortOrder: value.seasonSortOrder + '-' + value.sectionSortOrder
                };
            }
            return res;
        }, {});

        let list = [...Object.values(reduceResult)]

        for (const item of list) {

            let filterItem = filterList.filter(e => e.educationalTreeId == item.id);
            item.duration = filterItem.map(q => q.duration).reduce((c, f) => c + f, 0);
            item.duration = item.duration / 60;

            let reduceCounter = filterItem.filter(y => y.personRoleId != 0).reduce(function (res, value) {
                if (!res[value.educationalTreeId] + ',' + value.personRoleId) {
                    res[value.educationalTreeId + ',' + value.personRoleId] = {
                        id: value.educationalTreeId + ',' + value.personRoleId
                    };
                }
                return res;
            }, {});

            item.studentCount = [...Object.values(reduceCounter)].length;
            item.percent = CalculateExamPercentAverage(filterItem.map(a => a.percent));
        }

        list = list.sort(function (a, b) { return a.seasonSortOrder - b.seasonSortOrder || a.sectionSortOrder - b.sectionSortOrder; });

        return list;
    }
    //})()
}


function GetStudentActivityCountPerLesson(baseData) {
    
    var studentActivity = [];
    var croot = baseData.filter(i => i.examId > 0 && i.personRoleId > 0);
    croot.reduce(function (res, value) {
        if (!res[value.gradeFieldId + ',' + value.personRoleId + ',' + value.gradeLessonDetailId]) {
            res[value.gradeFieldId + ',' + value.personRoleId + ',' + value.gradeLessonDetailId] = {
                gradeFieldId: value.gradeFieldId,
                personRoleId: value.personRoleId,
                gradeLessonDetailId: value.gradeLessonDetailId,
                activityCount: 0
            };
            studentActivity.push(res[value.gradeFieldId + ',' + value.personRoleId + ',' + value.gradeLessonDetailId])
        }
        return res;
    }, {});

    for (const item of studentActivity) {

        var filterList = baseData.filter(e => e.gradeFieldId == item.gradeFieldId && e.personRoleId == item.personRoleId && e.gradeLessonDetailId == item.gradeLessonDetailId);
        let sum = 0; 
        filterList.forEach(obj => {
            for (let property in obj) {
                if(property == "selfExamCount")
                    sum += obj[property];
                if(property == "publicExamCount")
                    sum += obj[property];
            }
        })

        item.activityCount = sum;
            
    }

    return studentActivity; 
}