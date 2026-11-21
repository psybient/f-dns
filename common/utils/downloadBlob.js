import * as axios from "axios";
export async function getDownloadableContentOfBlobApi(
  api,
  extension = ".pdf",
  customFilename = null,
) {
  return await (async function () {
    return axios({
      method: "post",
      url: api,
      responseType: "blob",
      config: { headers: { "Content-Type": "multipart/form-data" } },
    })
      .then(async (result) => {
        const url = window.URL.createObjectURL(new Blob([result.data]));

        const filename = customFilename
          ? `${customFilename}${extension.startsWith(".") ? extension : "." + extension}`
          : new Date().getTime() +
            (extension.startsWith(".") ? extension : "." + extension);

        return await Promise.resolve(downloadBlob(url, filename));
      })
      .catch((err) => {
        console.error(err);
        throw err; // Important: re-throw so caller can catch it
      });
  })();
}

export function downloadBlob(url, filename) {
  // Create an object URL for the blob object
  //const url = URL.createObjectURL(blob);
  // Create a new anchor element
  const a = document.createElement("a");
  // Set the href and download attributes for the anchor element
  // You can optionally set other attributes like `title`, etc
  // Especially, if the anchor element will be attached to the DOM
  a.href = url;
  a.download = filename || "download";

  // Click handler that releases the object URL after the element has been clicked
  // This is required for one-off downloads of the blob content
  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      //this.removeEventListener('click', clickHandler);
    }, 150);
  };
  a.addEventListener("click", clickHandler, false);
  // Programmatically trigger a click on the anchor element
  // Useful if you want the download to happen automatically
  // Without attaching the anchor element to the DOM
  // Comment out this line if you don't want an automatic download of the blob content
  a.click();
  // Return the anchor element
  // Useful if you want a reference to the element
  // in order to attach it to the DOM or use it in some other way
  return a;
}
