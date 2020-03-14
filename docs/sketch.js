exceededMaxLength = false;
maxLength = 15;
needToCheck = false;
chart = undefined;

onReady = () => {
    const fileInput = document.getElementById("fileInput");
    fileInput.onchange = () => {
        if (fileInput.files.length > 0) {
            const fileName = document.getElementById("fileInputName");
            fileName.textContent = fileInput.files[0].name;
        }
    };
};

document.addEventListener("DOMContentLoaded", onReady);

function log(t) {
    if (document.getElementById("errorLog").innerText == "") {
        document.getElementById("errorLog").innerText = t;
    } else {
        document.getElementById("errorLog").innerText =
            document.getElementById("errorLog").innerText + "\n" + t;
    }
}

function assert(condition, statement) {
    if (condition) {
        if (!exceededMaxLength) {
            log(statement);
            if (needToCheck) {
                document.getElementById("hint").innerText =
                    "Please take a look at the expected format for the image file.";
                document.getElementById("logContainer").className = "message is-danger";
            }

            if (
                document.getElementById("errorLog").innerText.split("\n").length >=
                maxLength
            ) {
                exceededMaxLength = true;
                log("... I stopped counting after the first 15 errors.");
            }
        }

        needToCheck = true;
    }
}

function parseAndDraw() {
    exceededMaxLength = false;
    document.getElementById("logContainer").className = "message is-dark";
    document.getElementById("hint").innerText = "Log";
    document.getElementById("errorLog").innerText = "";

    const fileInput = document.getElementById("fileInput");

    const reader = new FileReader();
    reader.readAsText(fileInput.files[0]);
    reader.onerror = error => log(`FileReader: ${error}`);
    reader.onload = event => {
        log(`File read successfully.`);
        text = event.target.result.trim().split("\n");

        assert(text.length <= 3, "You've entered less than or equal to 3 lines.");

        assert(text[0] != "RGB", 'The first line of the file is not "RGB".');

        assert(
            isNaN(text[1]),
            "The second line of the entered text (Height) does not seem to contain a valid number."
        );

        assert(
            isNaN(text[2]),
            "The third line of the entered text (Width) does not seem to contain a valid number."
        );

        numPixels = text.length - 3;

        height = parseInt(text[1]);
        width = parseInt(text[2]);

        log(`The parsed height is ${height} pixels.`);
        log(`The parsed width is ${width} pixels.`);

        assert(
            height * width != numPixels,
            `Height (${height}) * Width (${width}) = ${height *
            width} is not equal to number of pixels I could find (${numPixels} pixels, calculated via number of lines (${
            text.length
            }) in the pasted text - 3).`
        );

        let img = [];
        let onlyRed = [];
        let onlyGreen = [];
        let onlyBlue = [];

        for (let i = 3; i < height * width + 3; i++) {
            let colors = text[i].split(" ");

            assert(
                colors.length != 3,
                `I can't find 3 colors for pixel no. ${i - 3}.`
            );
            let red = parseInt(colors[0]);
            let green = parseInt(colors[1]);
            let blue = parseInt(colors[2]);

            assert(
                isNaN(red),
                `I cannot parse the red component for pixel no. ${i - 3} as a number.`
            );

            assert(
                red < 0 && red > 255,
                `Red component of pixel no. ${i - 3} is not between 0 and 255.`
            );
            assert(
                isNaN(green),
                `I cannot parse the green component for pixel no. ${i - 3} as a number.`
            );

            assert(
                green < 0 && green > 255,
                `Green component of pixel no. ${i - 3} is not between 0 and 255.`
            );
            assert(
                isNaN(blue),
                `I cannot parse the blue component for pixel no. ${i - 3} as a number.`
            );

            assert(
                blue < 0 && blue > 255,
                `Blue component of pixel no. ${i - 3} is not between 0 and 255.`
            );

            img.push(red);
            img.push(green);
            img.push(blue);
            img.push(255);

            onlyRed.push(red);
            onlyGreen.push(green);
            onlyBlue.push(blue);
        }

        img = Uint8ClampedArray.from(img);
        onlyRed = Uint8ClampedArray.from(onlyRed);
        onlyGreen = Uint8ClampedArray.from(onlyGreen);
        onlyBlue = Uint8ClampedArray.from(onlyBlue);

        doTheThing(img, width, height);
        doTheHistogramThing(onlyRed, onlyBlue, onlyGreen);
        document.getElementById("logContainer").className = "message is-primary";
        document.getElementById("hint").innerText = "I think it worked.";
    };
}

function doTheHistogramThing(onlyRed, onlyBlue, onlyGreen) {
    var redctx = document.getElementById("histogram-red").getContext("2d");
    var greenctx = document.getElementById("histogram-green").getContext("2d");
    var bluectx = document.getElementById("histogram-blue").getContext("2d");
    Chart.defaults.global.datasets.scatter.showLine = true;

    const count = arr =>
        arr.reduce((prev, curr) => ((prev[curr] = ++prev[curr] || 1), prev), {});
    const getData = arr => {
        let counts = count(arr);
        let data = [];

        for (let i = 0; i < 256; i++) {
            if (i in counts) {
                data.push({
                    x: i,
                    y: counts[i]
                })
            }
            else {
                data.push({
                    x: i,
                    y: 0
                })
            }
        }

        return data;
    };

    let chartOptions = {
        scales: {
            xAxes: [{
                ticks: {
                    stepSize: 8,
                    min: 0,
                    max: 255
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }

    var redChart = new Chart(redctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Red',
                data: getData(onlyRed),
                backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                borderWidth: 1,
                borderColor: ['rgb(255, 0, 0)']
            }]
        },
        options: chartOptions
    });

    var greenChart = new Chart(greenctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Green',
                data: getData(onlyGreen),
                backgroundColor: ['rgba(75, 192, 192, 0.2)'],
                borderWidth: 1,
                borderColor: ['rgb(0, 255, 0)']
            }]
        },
        options: chartOptions
    });

    var blueChart = new Chart(bluectx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Blue',
                data: getData(onlyBlue),
                backgroundColor: ['rgba(54, 162, 235, 0.2)'],
                borderWidth: 1,
                borderColor: ['rgb(0, 0, 255)']
            }]
        },
        options: chartOptions
    });

    return redChart, greenChart, blueChart;
}

function doTheThing(imgArray, width, height) {
    const s = p => {
        p.setup = function () {
            let img = p.createImage(width, height);

            img.loadPixels();
            p.createCanvas(width, height);

            let i = 0;
            imgArray.forEach(pixel => {
                img.pixels[i] = pixel;
                i = i + 1;
            });

            img.updatePixels();
            p.image(img, 0, 0);

            p.noLoop();
        };
    };

    document.getElementById("sketch").innerHTML = "";
    let myp5 = new p5(s, "sketch");
}
