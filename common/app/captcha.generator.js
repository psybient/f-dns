export const generate = function (ctx, captchaTextNumber) {
  let captchaText = captchaTextNumber;
  let colour1 = generateRandomColour();
  let colour2 = generateRandomColour();
  let CWidth = 135;
  let CHeight = 40;

  const generateCaptcha = () => {
    var gradient1 = ctx.createLinearGradient(0, 0, CWidth, 0);
    gradient1.addColorStop(0, colour1);
    gradient1.addColorStop(1, colour2);

    ctx.fillStyle = gradient1;
    ctx.fillRect(0, 0, CWidth, CHeight);

    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillRect(0, 0, CWidth, CHeight);

    var gradient2 = ctx.createLinearGradient(0, 0, CWidth, 0);
    gradient2.addColorStop(0, colour2);
    gradient2.addColorStop(1, colour1);

    ctx.font = 'normal 23px "Comic Sans MS", cursive, sans-serif';
    ctx.fillStyle = gradient2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(captchaText, CWidth / 2, CHeight / 2);

    var numRandomCurves = Math.floor(Math.random() * 1 + 3);

    for (var i = 0; i < numRandomCurves; i++) {
      drawRandomCurve();
    }
    return captchaText;
  };

  //   async function generateRandomText() {
  //let possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  //let possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
  // let possibleCharacters = "123456789";
  // captchaText = '';
  // var length = Math.floor((Math.random() * 3) + 4);
  // for (var i = 0; i < length; i++) {
  //     captchaText += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
  // }
  // return captchaText;
  //   }

  function generateRandomColour() {
    return (
      "rgb(" +
      Math.floor(Math.random() * 255) +
      ", " +
      Math.floor(Math.random() * 255) +
      ", " +
      Math.floor(Math.random() * 255) +
      ")"
    );
  }

  function drawRandomCurve() {
    var gradient1 = ctx.createLinearGradient(0, 0, CWidth, 0);
    gradient1.addColorStop(0, Math.random() < 0.5 ? colour1 : colour2);
    gradient1.addColorStop(1, Math.random() < 0.5 ? colour1 : colour2);

    ctx.lineWidth = 1;
    ctx.strokeStyle = gradient1;
    ctx.beginPath();
    ctx.moveTo(
      Math.floor(Math.random() * CWidth),
      Math.floor(Math.random() * CHeight)
    );
    ctx.bezierCurveTo(
      Math.floor(Math.random() * CWidth),
      Math.floor(Math.random() * CHeight),
      Math.floor(Math.random() * CWidth),
      Math.floor(Math.random() * CHeight),
      Math.floor(Math.random() * CWidth),
      Math.floor(Math.random() * CHeight)
    );
    ctx.stroke();
  }

  return generateCaptcha();
};
