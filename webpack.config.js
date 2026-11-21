const path = require("path");
const webpack = require("webpack");
const ManifestPlugin = require("webpack-manifest-plugin");
const AssetsPlugin = require("assets-webpack-plugin");
const CleanPlugin = require("clean-webpack-plugin");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const entryPath = path.resolve(__dirname, "src");
const outputPath = path.resolve(__dirname, "wwwroot/dist");
const CopyPlugin = require("copy-webpack-plugin");

const packageJson = require("./package.json");
console.log(packageJson.version);

process.env.NODE_ENV = "development";
console.log(process.env.NODE_ENV);
console.log(process.env.WEBPACK_DEV_SERVER);

const vsRunning = false;
const devMode = process.env.NODE_ENV !== "production";

//const publicPath = devMode ? (vsRunning ? "http://localhost:12423/dist" : "http://localhost:5000/dist")  : "https://www.meraat.ir/dist";
//To test minified bundle on development uncomment following lines
//const publicPath = "https://localhost:5001/dist"; // this with reverse development flag to test minified bundle

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    cidentity: [
      entryPath + "/cidentity/typescript/cidentity",
      entryPath + "/cidentity/sass/cidentity.scss",
    ],
    cvideocapture: [
      entryPath + "/cvideocapture/typescript/cvideocapture",
      entryPath + "/cvideocapture/sass/cvideocapture.scss",
    ],
    alogin: [
      entryPath + "/alogin/typescript/alogin",
      entryPath + "/alogin/sass/alogin.scss",
    ],
    roleselection: [
      entryPath + "/alogin/typescript/roleselection",
      entryPath + "/alogin/sass/roleselection.scss",
    ],
    completetheinformation: [
      entryPath + "/alogin/typescript/completetheinformation",
      entryPath + "/alogin/sass/completetheinformation.scss",
    ],
    mreport: [
      entryPath + "/mreport/script/mreport",
      entryPath + "/mreport/sass/mreport.scss",
    ],
    eapperror: [
      entryPath + "/eapperror/typescript/eapperror",
      entryPath + "/eapperror/sass/eapperror.scss",
    ],
    epagenotfound: [
      entryPath + "/epagenotfound/typescript/epagenotfound",
      entryPath + "/epagenotfound/sass/epagenotfound.scss",
    ],
    sactivities: [
      entryPath + "/sactivities/script/sactivities",
      entryPath + "/sactivities/sass/sactivities.scss",
    ],
    passwordresetrequest: [
      entryPath + "/alogin/typescript/passwordresetrequest",
      entryPath + "/alogin/sass/passwordresetrequest.scss",
    ],
    passwordreset: [
      entryPath + "/alogin/typescript/passwordreset",
      entryPath + "/alogin/sass/passwordreset.scss",
    ],
    hintro: [
      entryPath + "/hintro/script/hintro",
      entryPath + "/hintro/sass/hintro.scss",
    ],
    sstudent: [
      entryPath + "/sstudent/script/sstudent",
      entryPath + "/sstudent/sass/sstudent.scss",
    ],
    sschoolfolder: [
      entryPath + "/sschoolfolder/script/sschoolfolder",
      entryPath + "/sschoolfolder/sass/sschoolfolder.scss",
    ],
    hcontactus: [
      entryPath + "/hcontactus/script/hcontactus",
      entryPath + "/hcontactus/sass/hcontactus.scss",
    ],
    sazmoonhamahang: [
      entryPath + "/sazmoonhamahang/script/sazmoonhamahang",
      entryPath + "/sazmoonhamahang/sass/sazmoonhamahang.scss",
    ],
    sperlz: [
      entryPath + "/sperlz/script/sperlz",
      entryPath + "/sperlz/sass/sperlz.scss",
    ],
    sonlineevaluation: [
      entryPath + "/sonlineevaluation/script/sonlineevaluation",
      entryPath + "/sonlineevaluation/sass/sonlineevaluation.scss",
    ],
    iwindows10app: [
      entryPath + "/iwindows10app/script/iwindows10app",
      entryPath + "/iwindows10app/sass/iwindows10app.scss",
    ],
    hfirstpage: [
      entryPath + "/hfirstpage/script/hfirstpage",
      entryPath + "/hfirstpage/sass/hfirstpage.scss",
    ],
    tverification: [
      entryPath + "/tverification/script/tverification",
      entryPath + "/tverification/sass/tverification.scss",
    ],
    tactivities: [
      entryPath + "/tactivities/script/tactivities",
      entryPath + "/tactivities/sass/tactivities.scss",
    ],
    sstudentdiscount: [
      entryPath + "/sstudentdiscount/script/sstudentdiscount",
      entryPath + "/sstudentdiscount/sass/sstudentdiscount.scss",
    ],
    sdagencyrequest: [
      entryPath + "/sdagencyrequest/script/sdagencyrequest",
      entryPath + "/sdagencyrequest/sass/sdagencyrequest.scss",
    ],
    slogsviewer: [
      entryPath + "/slogsviewer/script/slogsviewer",
      entryPath + "/slogsviewer/sass/slogsviewer.scss",
    ],
    svideo: [
      entryPath + "/svideo/script/svideo",
      entryPath + "/svideo/sass/svideo.scss",
    ],
    svideo2: [
      entryPath + "/svideo2/script/svideo2",
      entryPath + "/svideo2/sass/svideo2.scss",
    ],
    svideo3: [
      entryPath + "/svideo3/script/svideo3",
      entryPath + "/svideo3/sass/svideo3.scss",
    ],
    svideo4: [
      entryPath + "/svideo4/script/svideo4",
      entryPath + "/svideo4/sass/svideo4.scss",
    ],
    svideo5: [
      entryPath + "/svideo5/script/svideo5",
      entryPath + "/svideo5/sass/svideo5.scss",
    ],
    saudio: [
      entryPath + "/saudio/script/saudio",
      entryPath + "/saudio/sass/saudio.scss",
    ],
    saudio2: [
      entryPath + "/saudio2/script/saudio2",
      entryPath + "/saudio2/sass/saudio2.scss",
    ],
    saudio3: [
      entryPath + "/saudio3/script/saudio3",
      entryPath + "/saudio3/sass/saudio3.scss",
    ],
    saudio4: [
      entryPath + "/saudio4/script/saudio4",
      entryPath + "/saudio4/sass/saudio4.scss",
    ],
    cbookpdfviewer: [
      entryPath + "/cbookpdfviewer/script/cbookpdfviewer",
      entryPath + "/cbookpdfviewer/sass/cbookpdfviewer.scss",
    ],
    skarbargbadaneman: [
      entryPath + "/skarbargbadaneman/script/skarbargbadaneman",
      entryPath + "/skarbargbadaneman/sass/skarbargbadaneman.scss",
    ],
    snoamoozbadaneman: [
      entryPath + "/snoamoozbadaneman/script/snoamoozbadaneman",
      entryPath + "/snoamoozbadaneman/sass/snoamoozbadaneman.scss",
    ],
    snoamoozdonyayeman: [
      entryPath + "/snoamoozdonyayeman/script/snoamoozdonyayeman",
      entryPath + "/snoamoozdonyayeman/sass/snoamoozdonyayeman.scss",
    ],
    snoamoozkhaneman: [
      entryPath + "/snoamoozkhaneman/script/snoamoozkhaneman",
      entryPath + "/snoamoozkhaneman/sass/snoamoozkhaneman.scss",
    ],
    snoamoozshahreman: [
      entryPath + "/snoamoozshahreman/script/snoamoozshahreman",
      entryPath + "/snoamoozshahreman/sass/snoamoozshahreman.scss",
    ],
    skarbargdonyayeman: [
      entryPath + "/skarbargdonyayeman/script/skarbargdonyayeman",
      entryPath + "/skarbargdonyayeman/sass/skarbargdonyayeman.scss",
    ],
    skarbargkhaneman: [
      entryPath + "/skarbargkhaneman/script/skarbargkhaneman",
      entryPath + "/skarbargkhaneman/sass/skarbargkhaneman.scss",
    ],
    skarbargshahreman: [
      entryPath + "/skarbargshahreman/script/skarbargshahreman",
      entryPath + "/skarbargshahreman/sass/skarbargshahreman.scss",
    ],
    aregistration: [
      entryPath + "/aregistration/typescript/aregistration",
      entryPath + "/aregistration/sass/aregistration.scss",
    ],
    enaregistration: [
      entryPath + "/aregistration/typescript/aregistration",
      entryPath + "/aregistration/sass/enaregistration.scss",
    ],
    factivities: [
      entryPath + "/factivities/script/factivities",
      entryPath + "/factivities/sass/factivities.scss",
    ],
    ateacherlogin: [
      entryPath + "/ateacherlogin/script/ateacherlogin",
      entryPath + "/ateacherlogin/sass/ateacherlogin.scss",
    ],
    tfreelanceteacherverification: [
      entryPath +
        "/tfreelanceteacherverification/script/tfreelanceteacherverification",
      entryPath +
        "/tfreelanceteacherverification/sass/tfreelanceteacherverification.scss",
    ],
    spracticezone: [
      entryPath + "/spracticezone/script/spracticezone",
      entryPath + "/spracticezone/sass/spracticezone.scss",
    ],
    tindex: [
      entryPath + "/tindex/script/tindex",
      entryPath + "/tindex/sass/tindex.scss",
    ],
    dindex: [
      entryPath + "/dindex/script/dindex",
      entryPath + "/dindex/sass/dindex.scss",
    ],
    tbookverification: [
      entryPath + "/tbookverification/script/tbookverification",
      entryPath + "/tbookverification/sass/tbookverification.scss",
    ],
    bhome: [
      entryPath + "/bhome/typescript/bhome",
      entryPath + "/bhome/sass/bhome.scss",
    ],
    bpageplay: [
      entryPath + "/bpageplay/script/bpageplay",
      entryPath + "/bpageplay/sass/bpageplay.scss",
    ],
    bexplore: [
      entryPath + "/bexplore/typescript/bexplore",
      entryPath + "/bexplore/sass/bexplore.scss",
    ],
    bpageplayex: [
      entryPath + "/bpageplayex/script/bpageplayex",
      entryPath + "/bpageplayex/sass/bpageplayex.scss",
    ],
    bordercontrol: [
      entryPath + "/bordercontrol/script/bordercontrol",
      entryPath + "/bordercontrol/sass/bordercontrol.scss",
    ],
    mbookviewer: [
      entryPath + "/mbookpdfviewer/script/mbookpdfviewer",
      entryPath + "/mbookpdfviewer/sass/mbookviewer.scss",
    ],
    adashboard: [
      entryPath + "/adashboard/script/adashboard",
      entryPath + "/adashboard/sass/adashboard.scss",
    ],
  },

  output: {
    path: outputPath,
    filename: "[name].bundle" + packageJson.shortversion + ".js",
    chunkFilename: "[id].chunk.[chunkhash].js",
    publicPath: "/dist/",
  },
  devtool: devMode ? "source-map" : "none", //'source-map',
  //devtool:'none',
  devServer: {
    contentBase: outputPath,
    port: 8080,
    publicPath: "/dist/",
    hot: true,
    https: false,
    compress: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
  },
  node: {
    fs: "empty",
    module: "empty",
  },
  module: {
    rules: [
      {
        //new one
        test: /\.tsx?$/,
        use: ["babel-loader", "ts-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            exclude: [/jstree/, /chart.js/, /uikit/],
            presets: [
              "@babel/preset-react",
              "@babel/preset-env",
              { plugins: ["@babel/plugin-proposal-class-properties"] },
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
      {
        test: /\.txt$/,
        use: "raw-loader",
      },
      {
        test: /\.worker\.js$/,
        use: { loader: "worker-loader" },
        exclude: /(node_modules)/,
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].bundle" + packageJson.shortversion + ".css",
            },
          },
          { loader: "extract-loader" },
          {
            loader: "css-loader",
            options: {
              minimize: !devMode,
              sourceMap: devMode,
            },
          },
          { loader: "sass-loader" },
        ],
      },

      {
        test: /\.(woff2?|ttf|otf|eot)$/,
        exclude: /node_modules/,
        loader: "file-loader",
        options: {
          name: "fonts/[name].[ext]",
          publicPath: "/dist/", //publicPath
        },
      },

      {
        test: /\.(gif|png|jpg|svg)(\?.*$|$)/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 1192,
              name: "[name].[ext]",
              publicPath: "/dist/", //publicPath
            },
          },
        ],
      },
      {
        // Exposes jQuery for use outside Webpack build
        test: require.resolve("jquery"),
        use: [
          {
            loader: "expose-loader",
            options: "jQuery",
          },
          {
            loader: "expose-loader",
            options: "$",
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    // alias: {
    //     "DrawSVGPlugin": "gsap/dist/all.js"
    //   }
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      jalaliDatePicker: "@majidh1/jalalidatepicker",
    }),

    new CopyPlugin([
      {
        from: "./src/public",
        to: "./assets/",
        force: devMode,
      },
      //{ from: 'other', to: 'public' },
    ]),

    new MiniCssExtractPlugin({
      filename: "[name].bundle" + packageJson.shortversion + ".css",
      chunkFilename: "[id].chunk.[chunkhash].css",
    }),

    new ManifestPlugin(),

    new AssetsPlugin({
      fileName: "webpack.assets.json",
      path: outputPath,
    }),
  ],
};
// console.log(JSON.stringify(module.exports))
