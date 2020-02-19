# Image Viewer

A simple image viewer written for use in ITCS 3134 - Digital Image Processing.

The files it can display are of the following format -

> As an "output" for each Part of the assignment, you will be creating a text file using the program you write. Each part is going to ask of you to create an image, and each image will be in this following format -

> - The first line in the file will be `RGB` to represent that the image uses the RGB colorspace. `RGB` will be followed by a newline `\n`, so - `RGB\n`.
> - The second line will be a number representing the height of the image in pixels, so `256\n` for an image consisting of 256 pixels.
> - The third line in the image would be the width of the image in pixels, so `512\n` for a 512 pixel wide image.
> - From the fourth line onwards you will have the RGB color for each pixel, so `144 72 44\n` for the color `rgb(144, 72, 44)`. You will have as many lines as pixels in your image.

## Usage

First, download the binary for your OS. Currently, only Linux and Windows binaries are available. If your system isn't listed, or the binary doesn't work for you - use a library computer or follow the build instructions to build it for your system.

> On Windows, you might need to install ensure a Visual C/C++ runtime is installed first. You can do that by installing `vc_redist.x64.exe` from [here](https://support.microsoft.com/en-us/help/2977003/the-latest-supported-visual-c-downloads)

```$xslt
C:\Users\Dhruv Dhamani\Dropbox\documents\Digital Image Processing\dip_image_viewer>dip_viewer --help
ITCS 3134 Image Viewer 0.0.2
Dhruv Dhamani<ddhamani@uncc.edu>

USAGE:
    dip_viewer --file <FILE>

FLAGS:
    -h, --help       Prints help information
    -V, --version    Prints version information

OPTIONS:
    -f, --file <FILE>    The path to the text file to be displayed as an image
```

You can try it out using the `easy.txt` file in the root of this repository.

```$xslt
dip_viewer -f easy.txt
```

## Build instructions

Ensure you have rustup installed on your system - via https://rustup.rs/

> For linux you'll need some X11 headers to build - do run `sudo apt install libx11-dev libxft-dev` before proceeding

```$xslt
cargo build --release
```

This should build a `dip_viewer` executable in `target/releases`.

> Note: I've only tested it with nightly.
