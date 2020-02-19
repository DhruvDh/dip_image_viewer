exceededMaxLength = false;
maxLength = 15;
needToCheck = false;

function log(t) {
  if (document.getElementById('errorLog').value == "") {
    document.getElementById('errorLog').value = t;
  }
  else {
    document.getElementById('errorLog').value = document.getElementById('errorLog').value + "\n" + t;
  }
}

function assert(condition, statement) {
  if (condition) {
    if (!exceededMaxLength) {
      log(statement)
      if (needToCheck) {
        document.getElementById('hint').innerText = "Please take a look at the expected format for the image file.";
      }

      if (document.getElementById('errorLog').value.split("\n").length >= maxLength) {
        exceededMaxLength = true;
        log("... I stopped counting after the first 15 errors.")
      }
    }

    needToCheck = true
  }
}

function parseAndDraw() {
  document.getElementById('errorLog').value = "";

  text = document.getElementById("imgText").value.split("\n");

  console.log(text);

  assert(
    text.length <= 3,
    "You've entered less than or equal to 3 lines."
  )

  assert(
    text[0] != "RGB",
    "The first line of the file is not \"RGB\"."
  )

  assert(
    isNaN(text[1]),
    "The second line of the entered text (Height) does not seem to contain a valid number."
  )

  assert(
    isNaN(text[2]),
    "The third line of the entered text (Width) does not seem to contain a valid number."
  )

  numPixels = text.length - 3;

  height = parseInt(text[1])
  width = parseInt(text[2])


  log(`The parsed height is ${height} pixels.`)
  log(`The parsed width is ${width} pixels.`)

  assert(
    height * width != numPixels,
    `Height (${height}) * Width (${width}) = ${height * width} is not equal to number of pixels I could find (${numPixels} pixels, calculated via number of lines (${text.length}) in the pasted text - 3).`
  )

  let img = []

  for (let i = 3; i < numPixels + 3; i++) {
    let colors = text[i].split(' ')


    assert(
      colors.length != 3,
      `I can't find 3 colors for pixel no. ${i - 3}.`
    )
    let red = parseInt(colors[0]);
    let green = parseInt(colors[1]);
    let blue = parseInt(colors[2]);

    assert(
      isNaN(red),
      `I cannot parse the red component for pixel no. ${i - 3} as a number.`
    )

    assert(
      (red < 0) && (red > 255),
      `Red component of pixel no. ${i - 3} is not between 0 and 255.`
    )
    assert(
      isNaN(green),
      `I cannot parse the green component for pixel no. ${i - 3} as a number.`
    )

    assert(
      (green < 0) && (green > 255),
      `Green component of pixel no. ${i - 3} is not between 0 and 255.`
    )
    assert(
      isNaN(blue),
      `I cannot parse the blue component for pixel no. ${i - 3} as a number.`
    )

    assert(
      (blue < 0) && (blue > 255),
      `Blue component of pixel no. ${i - 3} is not between 0 and 255.`
    )
    // console.log(`${i}: (${red}, ${green}, ${blue})`);

    img.push([red, green, blue])
  }

  doTheThing(img, width, height)
}

function doTheThing(imgArray, width, height) {
  const s = (p) => {
    p.setup = function () {
      let img = p.createImage(height, width); // same as new p5.Image(100, 100);
      img.loadPixels();
      p.createCanvas(height, width);
      p.background(0);

      // helper for writing color to array
      function writeColor(image, x, y, red, green, blue, alpha) {
        let index = (x + y * width) * 4;
        image.pixels[index] = red;
        image.pixels[index + 1] = green;
        image.pixels[index + 2] = blue;
        image.pixels[index + 3] = alpha;
      }

      let x, y;
      // fill with random colors

      let i = 0;
      for (y = 0; y < img.height; y++) {
        for (x = 0; x < img.width; x++) {
          let red = imgArray[i][0];
          let green = imgArray[i][1];
          let blue = imgArray[i][2];
          let alpha = 255;
          writeColor(img, x, y, red, green, blue, alpha);

          i++;
        }
      }

      img.updatePixels();
      p.image(img, 0, 0);
    }
  };
  
  let myp5 = new p5(s, 'sketch');
}