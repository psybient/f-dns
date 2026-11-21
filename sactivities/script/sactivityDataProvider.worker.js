import * as axios from "axios";
import * as queryAdvisorViewApi from "./model/query.advisorview.api";
// try {
(async function () {
  var error = false;
  const getQuizeInfo = () =>
    new Promise(function (resolve) {
      resolve(axios.get("/api/School/GetInternalQuizInfo"));
    });

  const getKarpoosheData = async () => {
    const kDataPromise = () =>
      new Promise(function (resolve) {
        resolve(axios.get("/api/School/LoadKarpoosheDataCollection"));
      });
    const filterListPromise = () =>
      new Promise(function (resolve) {
        resolve(axios.get("/api/School/LoadLessonWithNoContentInSchool"));
      });
    const studentsListPromise = () =>
      new Promise(function (resolve) {
        resolve(axios.get("/api/School/LoadSchoolStuentsList"));
      });

    //var startTime = new Date().getTime();
    //var endTime;
    const [kData, filterList, studentsList] = await Promise.all([
      kDataPromise(),
      filterListPromise(),
      studentsListPromise(),
    ]).catch((err) => {
      console.log(err);
      return { kData: [], studentsList: [], filterList: [] };
    });
    // console.log({ kData, filterList, studentsList });
    //endTime = new Date().getTime();
    //console.log("data fetch took: " + (endTime - startTime) + "ms.");
    return {
      kData: kData.data,
      studentsList: studentsList.data,
      filterList: filterList.data,
    };
  };

  try {
    const baseData = await getKarpoosheData();
    if (error) {
      postMessage("has error");
      return;
    }
    if (baseData.kData.length === 0 || baseData.filterList.length === 0) {
      postMessage({
        layers: [],
        quizeInfo: [],
      });
      return;
    }
    const [layers, quizeInfo] = await Promise.all([
      generateReportViewLayers(baseData),
      getQuizeInfo(),
    ]).catch((err) => console.log(err));
    postMessage({
      layers: layers,
      quizeInfo: JSON.parse(JSON.stringify(quizeInfo.data)),
    });
  } catch {
    (err) => console.log(err);
    postMessage("no-data");
  }
})();
//

async function generateReportViewLayers(karpoosheData) {
  //var startTime = new Date().getTime();
  var baseData = karpoosheData.kData.karpoosheBase;
  var defaultstudentsList = karpoosheData.studentsList;
  //var filterList = karpoosheData.filterList;
  const baseGrades = queryAdvisorViewApi.GetRowsICollection(baseData);

  let baseLessons = queryAdvisorViewApi.GetRowsIIICollection(
    baseData,
    baseGrades
  );

  let baseEdu = queryAdvisorViewApi.GetRowsIVCollection(baseData, baseLessons);

  let activities = queryAdvisorViewApi.GetRowsVCollection(
    baseData,
    baseLessons
  );

  let studentTestList = activities.V;
  let allActivityPercent = activities.VPercent;

  // const subStudentTestList = queryAdvisorViewApi.GetRowsVICollection(baseData, studentTestList);
  const baseEduArray = [...Object.values(baseEdu)];
  const baseLessonsArray = [...Object.values(baseLessons)];
  //console.time("generateLessonAndEduCollectionBaseOnPersonRoleId");

  let students = await queryAdvisorViewApi
    .generateLessonAndEduCollectionBaseOnPersonRoleId(
      baseData,
      defaultstudentsList,
      allActivityPercent,
      baseEduArray,
      baseLessonsArray
    )
    .catch((err) => console.log(err));
  //console.timeEnd("generateLessonAndEduCollectionBaseOnPersonRoleId");

  //const studentsList = students.II.sort(function (a, b) { return b.readLeafCount - a.readLeafCount || b.percentBaseOnLesson - a.percentBaseOnLesson || b.durationBaseOnLesson - a.durationBaseOnLesson; });

  const studentLessonsList = students.III.sort(function (a, b) {
    return (
      b.readLeafCount - a.readLeafCount ||
      b.percent - a.percent ||
      b.duration - a.duration
    );
  });

  const studentEduList = students.IV;
  const singleStudentEduList = students.V;

  const baseLessonsSortedArray = baseLessonsArray.sort(function (a, b) {
    return b.percent - a.percent;
  });

  // generateStudyUnitComparisonList Sample
  // examType 1 => خودارزیابی
  // examType 2 => آزمون هماهنگ
  // examType 4 => همه
  // gradeFieldId => 7
  // gradeLessonDetailId = > 49 زبان انگلیسی
  //let classList = Array.from(Array(3), (_, x) => x);
  //const queryReports = queryAdvisorViewApi.generateStudyUnitComparisonList(studentEduList);//, 1, 7, '1399/10/30', '1400/02/19', 49, classList)

  ///var endTime = new Date().getTime();
  //console.log("data calculations took: " + (endTime - startTime) + "ms.");
  let layers = {
    manager: [
      baseGrades,
      baseLessonsSortedArray,
      studentLessonsList,
      studentEduList,
      studentTestList,
      singleStudentEduList,
    ],
    //'adviser': [baseGrades, studentsList, studentLessonsList, studentEduList, studentTestList],
    //'teacher': [baseGrades, baseLessonsArray, baseEduArray, studentEduList, studentTestList],
  };
  //console.log(layers)
  return layers;
}
