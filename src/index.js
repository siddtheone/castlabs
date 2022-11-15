import $ from "jquery";

const filePath = "https://demo.castlabs.com/tmp/text0.mp4";

fetch(filePath)
  .then((res) => res.arrayBuffer())
  .then((res) => {
    console.log(`${getTime()}Successfull loaded file ${filePath}`);

    const view = new Uint8Array(res);
    const [moofLength, moofEndIndex] = getLength(view, 0, "moof");
    const [mfhdLength, mfhdEndIndex] = getLength(view, moofEndIndex, "mfhd");
    const [trafLength, trafEndIndex] = getLength(view, mfhdEndIndex, "traf");
    const [tfhdLength, tfhdEndIndex] = getLength(view, trafEndIndex, "tfhd");
    const [trunLength, trunEndIndex] = getLength(view, tfhdEndIndex, "trun");
    const [uuid1Length, uuid1EndIndex] = getLength(view, trunEndIndex, "uuid");
    const [uuid2Length, uuid2EndIndex] = getLength(view, uuid1EndIndex, "uuid");
    const mdatContent = getMDATContent(view, uuid2EndIndex);

    [
      { type: "moof", size: moofLength },
      { type: "mfhd", size: mfhdLength },
      { type: "traf", size: trafLength },
      { type: "tfhd", size: tfhdLength },
      { type: "trun", size: trunLength },
      { type: "uuid", size: uuid1Length },
      { type: "uuid", size: uuid2Length },
      { type: "mdat", size: mdatContent.length }
    ].forEach(printBox);

    console.log(`${getTime()} Content of mdat box is: ${mdatContent}`);

    const images = [
      ...mdatContent.matchAll(/<smpte:image .+?>([\S\s]*?)<\/smpte:image>/g)
    ].map((ele) => ele[1].trim());

    images.forEach((imgSrc) =>
      $("body").append(`<img src="data:image/png;base64,${imgSrc}" />`)
    );
  });

function getMDATContent(view, i) {
  let res = "";
  let mdatEndIndex;
  while (i < view.length) {
    const word = [
      getChar(view[i]),
      getChar(view[i + 1]),
      getChar(view[i + 2]),
      getChar(view[i + 3])
    ].join("");

    if (word === "mdat") {
      mdatEndIndex = i + 4;
      break;
    }
    i++;
  }

  while (mdatEndIndex <= view.length) {
    res += getChar(view[mdatEndIndex]);
    mdatEndIndex++;
  }

  return res;
}

function getLength(view, i, string) {
  while (true) {
    if (
      [
        getChar(view[i]),
        getChar(view[i + 1]),
        getChar(view[i + 2]),
        getChar(view[i + 3])
      ].join("") === string
    ) {
      break;
    }

    i += 4;
  }

  return [view[i - 1], i + 4];
}

function getTime() {
  const d = new Date();
  return d.toISOString().replace(/[TZ]/g, " ");
}

function printBox({ type, size }) {
  console.log(`${getTime()}Found box of type ${type} and size ${size}`);
}

function getChar(code) {
  return String.fromCharCode(code);
}

// fetch(filePath)
//   .then((res) => res.arrayBuffer())
//   .then((res) => {
//     const view = new Uint8Array(res);
//     console.log(view);
//     console.log(`${getTime()}Successfull loaded file ${filePath}`);
//     [
//       { type: "moof", size: view[3] },
//       { type: "mfhd", size: view[11] },
//       { type: "traf", size: view[27] },
//       { type: "tfhd", size: view[35] },
//       { type: "trun", size: view[59] },
//       { type: "uuid", size: view[79] },
//       { type: "uuid", size: view[123] },
//       { type: "mdat", size: view.length - 181 },
//     ].forEach(printBox);
//     let mdatContent = [];
//     for (let i = 181; i < view.length; i++) {
//       mdatContent.push(view[i]);
//     }
//     console.log(`${getTime()}Content of mdat box is: ${view[2500]}`);
//   });
